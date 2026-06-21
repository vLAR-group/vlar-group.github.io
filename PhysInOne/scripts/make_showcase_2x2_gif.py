#!/usr/bin/env python3
"""Create a synchronized 2x2 GIF from four videos using ffmpeg."""

import argparse
import json
import statistics
import subprocess
import sys
from pathlib import Path
from typing import Dict, List


SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent

DEFAULT_INPUTS = [
    PROJECT_ROOT
    / "static"
    / "videos"
    / "showcase"
    / "Mechanics"
    / "CatapultLaunch_StickSupportFail__bg177__v11WsG_trajectory"
    / "CatapultLaunch_StickSupportFail__bg177__v11WsG_camera11_h264.mp4",
    PROJECT_ROOT
    / "static"
    / "videos"
    / "showcase"
    / "Optics"
    / "FixedConvexRedirect__bg177__2YMn3l_trajectory"
    / "FixedConvexRedirect__bg177__2YMn3l_camera0_h264.mp4",
    PROJECT_ROOT
    / "static"
    / "videos"
    / "showcase"
    / "Magnetism"
    / "ObliqueProjectile_MagnetAttract__bg162__U7NHVI_trajectory"
    / "ObliqueProjectile_RollUpSlope_MagnetAttract__bg162__U7NHVI_camera0.mp4",
    PROJECT_ROOT
    / "static"
    / "videos"
    / "showcase"
    / "Fluid Dynamics"
    / "LiquidMultiTransfers_LiquidRise_LiquidTension__bg539__Ytjd3F_trajectory"
    / "LiquidMultiTransfers_LiquidRise_LiquidTension__bg539__Ytjd3F_camera2_h264.mp4",
]

DEFAULT_OUTPUT = (
    PROJECT_ROOT / "static" / "videos" / "showcase" / "showcase_2x2_sync.gif"
)


def ratio_type(value: str) -> float:
    """Validate ratio input in range (0, 1]."""
    try:
        ratio = float(value)
    except ValueError as exc:
        raise argparse.ArgumentTypeError("resolution ratio must be a float") from exc

    if not (0.0 < ratio <= 1.0):
        raise argparse.ArgumentTypeError("resolution ratio must be in range (0, 1]")
    return ratio


def positive_int_type(value: str) -> int:
    """Validate positive integer CLI values."""
    try:
        num = int(value)
    except ValueError as exc:
        raise argparse.ArgumentTypeError("value must be an integer") from exc

    if num <= 0:
        raise argparse.ArgumentTypeError("value must be > 0")
    return num


def to_even(value: float) -> int:
    """Round to nearest even integer greater than zero."""
    size = max(2, int(round(value)))
    if size % 2 != 0:
        size += 1
    return size


def probe_video(video_path: Path, ffprobe_bin: str) -> Dict[str, float]:
    """Read width, height and duration from a video using ffprobe."""
    cmd = [
        ffprobe_bin,
        "-v",
        "error",
        "-show_entries",
        "stream=width,height,duration",
        "-show_entries",
        "format=duration",
        "-of",
        "json",
        str(video_path),
    ]

    result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    data = json.loads(result.stdout)

    streams = data.get("streams", [])
    stream = next(
        (item for item in streams if "width" in item and "height" in item),
        None,
    )
    if stream is None:
        raise RuntimeError(f"No valid video stream found in: {video_path}")

    duration_raw = stream.get("duration")
    if duration_raw in (None, "N/A"):
        duration_raw = data.get("format", {}).get("duration")
    if duration_raw in (None, "N/A"):
        raise RuntimeError(f"Cannot read duration from: {video_path}")

    duration = float(duration_raw)
    if duration <= 0:
        raise RuntimeError(f"Invalid duration ({duration}) from: {video_path}")

    return {
        "width": int(stream["width"]),
        "height": int(stream["height"]),
        "duration": duration,
    }


def resolve_target_duration(durations: List[float], mode: str) -> float:
    """Calculate the normalized target duration for all clips."""
    if mode == "max":
        return max(durations)
    if mode == "min":
        return min(durations)
    if mode == "mean":
        return statistics.mean(durations)
    if mode == "first":
        return durations[0]
    raise ValueError(f"Unsupported normalize mode: {mode}")


def build_filter_complex(
    durations: List[float],
    target_duration: float,
    tile_width: int,
    tile_height: int,
    fps: int,
) -> str:
    """Construct ffmpeg filter graph for normalized timing and 2x2 layout."""
    parts: List[str] = []

    for idx, duration in enumerate(durations):
        setpts_factor = target_duration / duration
        parts.append(
            f"[{idx}:v]"
            f"setpts={setpts_factor:.12f}*PTS,"
            f"fps={fps},"
            f"scale={tile_width}:{tile_height}:force_original_aspect_ratio=decrease,"
            f"pad={tile_width}:{tile_height}:(ow-iw)/2:(oh-ih)/2:color=black,"
            f"setsar=1"
            f"[v{idx}]"
        )

    parts.append("[v0][v1][v2][v3]xstack=inputs=4:layout=0_0|w0_0|0_h0|w0_h0[grid]")
    parts.append("[grid]split[gif_src][palette_src]")
    parts.append("[palette_src]palettegen=max_colors=256:stats_mode=single[palette]")
    parts.append("[gif_src][palette]paletteuse=dither=sierra2_4a[outv]")

    return ";".join(parts)


def parse_args() -> argparse.Namespace:
    """Parse CLI arguments."""
    parser = argparse.ArgumentParser(
        description=(
            "Create a synchronized 2x2 GIF from 4 videos and normalize their durations "
            "so they end at the same time."
        )
    )
    parser.add_argument(
        "--inputs",
        nargs=4,
        default=[str(path) for path in DEFAULT_INPUTS],
        metavar=("VIDEO_1", "VIDEO_2", "VIDEO_3", "VIDEO_4"),
        help="Exactly four input videos in reading order (top-left to bottom-right).",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help="Output GIF path.",
    )
    parser.add_argument(
        "--resolution-ratio",
        type=ratio_type,
        default=0.5,
        help="Scale ratio in (0, 1] for each tile resolution based on min input size.",
    )
    parser.add_argument(
        "--fps",
        type=positive_int_type,
        default=12,
        help="Output GIF frame rate.",
    )
    parser.add_argument(
        "--normalize-to",
        choices=["max", "min", "mean", "first"],
        default="max",
        help="Target duration mode used to synchronize all clips.",
    )
    parser.add_argument(
        "--ffmpeg-bin",
        default="ffmpeg",
        help="ffmpeg executable name or absolute path.",
    )
    parser.add_argument(
        "--ffprobe-bin",
        default="ffprobe",
        help="ffprobe executable name or absolute path.",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Overwrite output if it already exists.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print ffmpeg command without running it.",
    )
    return parser.parse_args()


def main() -> int:
    """Entrypoint."""
    args = parse_args()

    input_paths = [Path(item).resolve() for item in args.inputs]
    output_path = args.output.resolve()

    for path in input_paths:
        if not path.exists():
            print(f"Error: input file not found: {path}")
            return 1

    output_path.parent.mkdir(parents=True, exist_ok=True)

    try:
        metadata = [probe_video(path, args.ffprobe_bin) for path in input_paths]
    except subprocess.CalledProcessError as exc:
        print("Error: ffprobe failed.")
        if exc.stderr:
            print(exc.stderr)
        return 1
    except (ValueError, RuntimeError, json.JSONDecodeError) as exc:
        print(f"Error: {exc}")
        return 1

    durations = [item["duration"] for item in metadata]
    min_width = min(int(item["width"]) for item in metadata)
    min_height = min(int(item["height"]) for item in metadata)

    tile_width = to_even(min_width * args.resolution_ratio)
    tile_height = to_even(min_height * args.resolution_ratio)
    target_duration = resolve_target_duration(durations, args.normalize_to)

    filter_complex = build_filter_complex(
        durations=durations,
        target_duration=target_duration,
        tile_width=tile_width,
        tile_height=tile_height,
        fps=args.fps,
    )

    ffmpeg_cmd = [args.ffmpeg_bin, "-y" if args.overwrite else "-n"]
    for path in input_paths:
        ffmpeg_cmd.extend(["-i", str(path)])

    ffmpeg_cmd.extend(
        [
            "-filter_complex",
            filter_complex,
            "-map",
            "[outv]",
            "-an",
            "-t",
            f"{target_duration:.6f}",
            "-loop",
            "0",
            str(output_path),
        ]
    )

    print("Input videos:")
    for idx, (path, info) in enumerate(zip(input_paths, metadata), start=1):
        print(
            f"  {idx}. {path} | {info['width']}x{info['height']} | "
            f"{info['duration']:.3f}s"
        )
    print(f"Tile size: {tile_width}x{tile_height}")
    print(f"Final GIF size: {tile_width * 2}x{tile_height * 2}")
    print(f"Normalized target duration: {target_duration:.3f}s ({args.normalize_to})")
    print(f"Output: {output_path}")

    if args.dry_run:
        print("\nDry-run command:")
        print(" ".join(ffmpeg_cmd))
        return 0

    try:
        subprocess.run(ffmpeg_cmd, check=True)
    except subprocess.CalledProcessError as exc:
        print("Error: ffmpeg failed.")
        if exc.stderr:
            print(exc.stderr)
        return exc.returncode or 1

    print("GIF generated successfully.")
    return 0


if __name__ == "__main__":
    sys.exit(main())