#!/usr/bin/env python3
"""
Generate showcase manifest.json for PhysInOne website.

This script scans the showcase video folders and generates a manifest file
that describes available videos, categories, and camera views.

Usage:
    python scripts/generate_showcase_manifest.py

Output:
    static/videos/showcase/manifest.json
"""

import json
import os
import re
from pathlib import Path
from typing import Dict, List, Any

# Configuration
SHOWCASE_ROOT = Path(__file__).parent.parent / "static" / "videos" / "showcase"
OUTPUT_FILE = SHOWCASE_ROOT / "manifest.json"
CONFIG_FILE = Path(__file__).parent / "showcase_config.yaml"

# Available camera views
CAMERAS = [
    "camera0", "camera1", "camera2", "camera3", "camera4", "camera5",
    "camera6", "camera7", "camera8", "camera9", "camera10", "camera11",
    "cameraMoving"
]


def load_category_modes() -> Dict[str, str]:
    """Load category modes from config file, or return empty dict."""
    try:
        import yaml
        if CONFIG_FILE.exists():
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                config = yaml.safe_load(f)
            modes = {}
            for cat_name, cat_config in config.get("categories", {}).items():
                if cat_config:
                    modes[cat_name] = cat_config.get("mode", "multi")
            return modes
    except ImportError:
        pass
    except Exception as e:
        print(f"Warning: Could not load config: {e}")
    return {}


def find_trajectory_scenes(category_path: Path) -> List[Dict[str, Any]]:
    """Find all trajectory scene folders in a category."""
    scenes = []
    
    for item in category_path.iterdir():
        if item.is_dir() and "_trajectory" in item.name:
            # Extract scene name from folder name (remove _trajectory suffix)
            scene_name = item.name.replace("_trajectory", "")
            
            # Find all H264 video files and detect available cameras
            h264_files = list(item.glob("*_h264.mp4"))
            if h264_files:
                # Detect cameras from RGB h264 files (not depth or seg)
                cameras = set()
                camera_pattern = re.compile(r'(camera\d+|cameraMoving)_h264\.mp4$')
                for f in h264_files:
                    match = camera_pattern.search(f.name)
                    if match:
                        cameras.add(match.group(1))
                
                # Sort cameras: numeric cameras first (sorted), then cameraMoving
                def camera_sort_key(cam):
                    if cam == 'cameraMoving':
                        return (1, 0)  # Moving camera last
                    num = int(re.search(r'\d+', cam).group())
                    return (0, num)
                
                sorted_cameras = sorted(cameras, key=camera_sort_key)
                
                scenes.append({
                    "basePath": str(item.relative_to(SHOWCASE_ROOT.parent.parent.parent)).replace("\\", "/"),
                    "sceneName": scene_name,
                    "cameras": sorted_cameras
                })
    
    return scenes


def find_single_videos(category_path: Path) -> List[str]:
    """Find all single MP4 videos in a category (non-trajectory)."""
    videos = []
    
    for mp4_file in category_path.glob("*.mp4"):
        # Skip backup folders and non-H264 files if H264 versions exist
        if "backup" in str(mp4_file):
            continue
        
        rel_path = str(mp4_file.relative_to(SHOWCASE_ROOT.parent.parent.parent)).replace("\\", "/")
        videos.append(rel_path)
    
    return sorted(videos)


def generate_manifest() -> Dict[str, Any]:
    """Generate the complete manifest structure."""
    manifest = {
        "version": "1.0",
        "cameras": CAMERAS,
        "categories": {}
    }
    
    # Load category modes from config
    category_modes = load_category_modes()
    
    # Scan each category folder
    for category_dir in SHOWCASE_ROOT.iterdir():
        if not category_dir.is_dir():
            continue
        
        category_name = category_dir.name
        
        # Determine mode: from config, or auto-detect based on folder structure
        mode = category_modes.get(category_name)
        
        if mode is None:
            # Auto-detect: check if there are trajectory folders with h264 videos
            scenes = find_trajectory_scenes(category_dir)
            if scenes:
                mode = "multi"
            else:
                mode = "single"
        
        if mode == "multi":
            # Multi-video mode: look for trajectory folders
            scenes = find_trajectory_scenes(category_dir)
            if scenes:
                manifest["categories"][category_name] = {
                    "mode": "multi",
                    "scenes": scenes
                }
        else:
            # Single-video mode: look for MP4 files directly
            videos = find_single_videos(category_dir)
            if videos:
                manifest["categories"][category_name] = {
                    "mode": "single",
                    "videos": videos
                }
    
    return manifest


def main():
    """Main entry point."""
    print(f"Scanning showcase folder: {SHOWCASE_ROOT}")
    
    if not SHOWCASE_ROOT.exists():
        print(f"Error: Showcase folder not found: {SHOWCASE_ROOT}")
        return 1
    
    manifest = generate_manifest()
    
    # Write manifest JSON
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    
    # Also write manifest.js for script tag loading (avoids CORS issues with file://)
    js_output = SHOWCASE_ROOT / "manifest.js"
    with open(js_output, "w", encoding="utf-8") as f:
        f.write("// Auto-generated showcase manifest\n")
        f.write("window.SHOWCASE_MANIFEST = ")
        json.dump(manifest, f, indent=2, ensure_ascii=False)
        f.write(";\n")
    
    print(f"Generated manifest: {OUTPUT_FILE}")
    print(f"Generated manifest.js: {js_output}")
    print(f"Categories found: {list(manifest['categories'].keys())}")
    
    for cat_name, cat_data in manifest["categories"].items():
        if cat_data["mode"] == "multi":
            print(f"  - {cat_name}: {len(cat_data['scenes'])} scenes (multi-video)")
        else:
            print(f"  - {cat_name}: {len(cat_data['videos'])} videos (single)")
    
    return 0


if __name__ == "__main__":
    exit(main())
