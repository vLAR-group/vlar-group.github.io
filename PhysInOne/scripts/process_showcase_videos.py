#!/usr/bin/env python3
"""
Process showcase videos based on configuration file.

This script:
1. Reads showcase_config.yaml
2. Converts source videos to H.264 codec (browser compatible)
3. Outputs to static/videos/showcase/{category}/{scene}_trajectory/
4. Runs generate_showcase_manifest.py to update the manifest

Usage:
    python scripts/process_showcase_videos.py
    python scripts/process_showcase_videos.py --skip-encode

Requirements:
    - ffmpeg must be installed and in PATH
    - PyYAML: pip install pyyaml
"""

import json
import argparse
import os
import re
import shutil
import subprocess
import sys
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple

try:
    import yaml
except ImportError:
    print("Error: PyYAML is required. Install with: pip install pyyaml")
    sys.exit(1)

# Configuration
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
SHOWCASE_ROOT = PROJECT_ROOT / "static" / "videos" / "showcase"
CONFIG_FILE = SCRIPT_DIR / "showcase_config.yaml"

# FFmpeg settings
FFMPEG_PRESET = "fast"
FFMPEG_CRF = "23"  # Quality (lower = better, 18-28 is good range)

# Parallel processing
MAX_WORKERS = 8  # Number of parallel ffmpeg processes


def check_ffmpeg() -> bool:
    """Check if ffmpeg is available."""
    try:
        subprocess.run(["ffmpeg", "-version"], capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False


def parse_args() -> argparse.Namespace:
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Process showcase videos by encoding to H.264 or copying directly."
    )
    parser.add_argument(
        "--skip-encode",
        action="store_true",
        help="Skip ffmpeg encoding and copy source videos directly to the output folder while keeping _h264 filenames for compatibility."
    )
    return parser.parse_args()


def get_scene_name_from_folder(folder_path: Path) -> str:
    """Extract scene name from folder path (remove _trajectory suffix)."""
    folder_name = folder_path.name
    if folder_name.endswith("_trajectory"):
        return folder_name[:-len("_trajectory")]
    return folder_name


def find_source_videos(src_folder: Path, mode: str) -> Dict[str, List[Path]]:
    """
    Find all source videos in a folder.
    
    Returns dict grouped by camera for multi mode, or flat list for single mode.
    """
    videos = {}
    
    if not src_folder.exists():
        print(f"  Warning: Source folder not found: {src_folder}")
        return videos
    
    if mode == "multi":
        # Group by camera: camera0, camera1, ..., cameraMoving
        camera_pattern = re.compile(r"_camera(\d+|Moving)(\.mp4|_depth\.mp4|_seg\.mp4)$", re.IGNORECASE)
        
        for mp4 in src_folder.glob("*.mp4"):
            match = camera_pattern.search(mp4.name)
            if match:
                camera_id = match.group(1)
                camera_key = f"camera{camera_id}"
                if camera_key not in videos:
                    videos[camera_key] = []
                videos[camera_key].append(mp4)
    else:
        # Single mode: just collect all mp4 files
        videos["all"] = list(src_folder.glob("*.mp4"))
    
    return videos


def convert_video_h264(input_path: Path, output_path: Path) -> bool:
    """Convert a video to H.264 codec using ffmpeg."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    cmd = [
        "ffmpeg",
        "-i", str(input_path),
        "-c:v", "libx264",
        "-preset", FFMPEG_PRESET,
        "-crf", FFMPEG_CRF,
        "-c:a", "aac",
        "-y",  # Overwrite output
        str(output_path)
    ]
    
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout per video
        )
        return result.returncode == 0
    except subprocess.TimeoutExpired:
        return False
    except Exception:
        return False


def copy_video_file(input_path: Path, output_path: Path) -> bool:
    """Copy a video file without re-encoding."""
    output_path.parent.mkdir(parents=True, exist_ok=True)

    try:
        shutil.copy2(input_path, output_path)
        return True
    except Exception:
        return False


def copy_scene_caption(src_folder: Path, output_folder: Path, same_folder: bool) -> bool:
    """Copy caption.txt from source folder to output folder when available."""
    caption_src = src_folder / "caption.txt"
    caption_dst = output_folder / "caption.txt"

    if not caption_src.exists():
        print("    Caption: caption.txt not found")
        return False

    # In-place processing keeps caption in the same location.
    if same_folder:
        print("    Caption: caption.txt kept in-place")
        return True

    try:
        shutil.copy2(caption_src, caption_dst)
        print("    Caption: caption.txt copied")
        return True
    except Exception as exc:
        print(f"    Caption copy failed: {exc}")
        return False


def process_video_worker(args: Tuple[Path, Path, bool]) -> Tuple[str, bool, str]:
    """
    Worker function for parallel video processing.
    
    Args:
        args: Tuple of (input_path, output_path, skip_encode)
    
    Returns:
        Tuple of (video_name, success, status_message)
    """
    input_path, output_path, skip_encode = args
    video_name = input_path.name

    if skip_encode:
        success = copy_video_file(input_path, output_path)
    else:
        success = convert_video_h264(input_path, output_path)

    status = "✓" if success else "✗"
    
    return (video_name, success, status)


def process_scene(
    category: str,
    src_folder: Path,
    mode: str,
    scene_name: Optional[str] = None,
    skip_encode: bool = False
) -> bool:
    """
    Process a single scene folder.
    
    Returns True if successful.
    """
    if not src_folder.exists():
        print(f"  Skipping (not found): {src_folder}")
        return False
    
    # Determine scene name and output folder
    if scene_name is None:
        scene_name = get_scene_name_from_folder(src_folder)
    
    output_folder = SHOWCASE_ROOT / category / f"{scene_name}_trajectory"
    
    # Check if source and output are the same folder
    src_resolved = src_folder.resolve()
    output_resolved = output_folder.resolve()
    same_folder = src_resolved == output_resolved
    
    print(f"  Processing: {scene_name}")
    print(f"    Source: {src_folder}")
    print(f"    Output: {output_folder}")
    if same_folder:
        print(f"    (in-place processing)")
    
    # Find source videos
    videos = find_source_videos(src_folder, mode)
    
    if not videos:
        print(f"    No videos found!")
        return False
    
    # Clean output folder if it exists (only if different from source)
    if not same_folder:
        if output_folder.exists():
            shutil.rmtree(output_folder)
        output_folder.mkdir(parents=True, exist_ok=True)

    # Copy scene caption (if provided by source folder).
    copy_scene_caption(src_folder, output_folder, same_folder)
    
    # Collect conversion tasks
    tasks = []  # List of (input_path, output_path, skip_encode)
    skipped = 0
    
    for camera_key, video_list in videos.items():
        for video_path in video_list:
            # Skip if already h264 file
            if "_h264" in video_path.stem:
                skipped += 1
                continue
            
            # Build output filename with _h264 suffix
            output_name = video_path.stem + "_h264.mp4"
            output_path = output_folder / output_name
            
            # Skip if output already exists (for in-place conversion)
            if same_folder and output_path.exists():
                print(f"    Skipping (exists): {output_name}")
                skipped += 1
                continue
            
            tasks.append((video_path, output_path, skip_encode))
    
    if not tasks:
        print(f"    Done: 0 converted, {skipped} skipped, 0 failed")
        return True
    
    # Process videos in parallel
    converted = 0
    failed = 0
    total_tasks = len(tasks)
    
    action = "Copying" if skip_encode else "Converting"
    done_label = "copied" if skip_encode else "converted"
    print(f"    {action} {total_tasks} videos using {MAX_WORKERS} workers...")
    
    with ProcessPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(process_video_worker, task): task for task in tasks}
        
        for future in as_completed(futures):
            video_name, success, status = future.result()
            print(f"    [{converted + failed + 1}/{total_tasks}] {video_name} {status}")
            
            if success:
                converted += 1
            else:
                failed += 1
    
    print(f"    Done: {converted} {done_label}, {skipped} skipped, {failed} failed")
    return failed == 0


def process_category(category: str, config: Dict[str, Any], skip_encode: bool = False) -> int:
    """
    Process all scenes in a category.
    
    Returns number of successfully processed scenes.
    """
    mode = config.get("mode", "multi")
    scenes = config.get("scenes", [])
    
    category_folder = SHOWCASE_ROOT / category
    
    # Build list of expected scene folder names from config
    expected_scenes = set()
    for scene_config in scenes:
        if isinstance(scene_config, dict):
            src = scene_config.get("src")
            name = scene_config.get("name")
        else:
            src = scene_config
            name = None
        
        if src:
            src_path = Path(src)
            scene_name = name if name else get_scene_name_from_folder(src_path)
            expected_scenes.add(f"{scene_name}_trajectory")
    
    # Clean up: remove scene folders not in config
    if category_folder.exists():
        for item in category_folder.iterdir():
            if item.is_dir() and "_trajectory" in item.name:
                if item.name not in expected_scenes:
                    print(f"  Removing outdated scene: {item.name}")
                    shutil.rmtree(item)
    
    if not scenes:
        print(f"  No scenes configured")
        return 0
    
    success_count = 0
    
    for scene_config in scenes:
        if isinstance(scene_config, dict):
            src = scene_config.get("src")
            name = scene_config.get("name")
        else:
            src = scene_config
            name = None
        
        if not src:
            continue
        
        src_path = Path(src)
        
        if process_scene(category, src_path, mode, name, skip_encode=skip_encode):
            success_count += 1
    
    return success_count


def load_config() -> Dict[str, Any]:
    """Load configuration from YAML file."""
    if not CONFIG_FILE.exists():
        print(f"Error: Config file not found: {CONFIG_FILE}")
        print("Create it by copying showcase_config.yaml.example")
        sys.exit(1)
    
    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def run_manifest_generator():
    """Run the manifest generator script."""
    manifest_script = SCRIPT_DIR / "generate_showcase_manifest.py"
    
    print("\n" + "=" * 50)
    print("Updating manifest...")
    
    result = subprocess.run(
        [sys.executable, str(manifest_script)],
        capture_output=True,
        text=True
    )
    
    if result.returncode == 0:
        print(result.stdout)
        return True
    else:
        print(f"Error: {result.stderr}")
        return False


def main():
    """Main entry point."""
    args = parse_args()

    print("=" * 50)
    print("Showcase Video Processor")
    print("=" * 50)
    
    # Check ffmpeg
    if not args.skip_encode and not check_ffmpeg():
        print("Error: ffmpeg not found. Please install ffmpeg and add it to PATH.")
        return 1

    if args.skip_encode:
        print("Mode: skip encode, copy source videos directly")
    
    # Load config
    config = load_config()
    categories = config.get("categories", {})
    
    if not categories:
        print("No categories found in config file.")
        return 1
    
    # Clean up: remove category folders not in config
    expected_categories = set(categories.keys())
    if SHOWCASE_ROOT.exists():
        for item in SHOWCASE_ROOT.iterdir():
            if item.is_dir() and item.name not in expected_categories:
                # Don't delete manifest files
                if item.name not in ["manifest.json", "manifest.js"]:
                    print(f"\n[Cleanup] Removing category not in config: {item.name}")
                    shutil.rmtree(item)
    
    # Process each category
    total_scenes = 0
    
    for category_name, category_config in categories.items():
        print(f"\n[{category_name}]")
        
        if not category_config or not category_config.get("scenes"):
            print("  No scenes configured, skipping")
            continue
        
        success = process_category(category_name, category_config, skip_encode=args.skip_encode)
        total_scenes += success
    
    # Update manifest
    if total_scenes > 0:
        run_manifest_generator()
    else:
        print("\nNo scenes processed. Manifest not updated.")
    
    print("\n" + "=" * 50)
    print(f"Complete! Processed {total_scenes} scenes.")
    print("=" * 50)
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
