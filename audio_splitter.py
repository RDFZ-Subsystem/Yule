from moviepy.editor import AudioFileClip
import os

def split_audio(input_file, timestamps):
    """
    使用MoviePy从总音频文件中分割出音效片段
    
    参数:
    input_file: 输入的音频文件路径
    timestamps: 字典，包含每个音效的开始时间和持续时间（秒）
    """
    try:
        # 确保输出目录存在
        os.makedirs('static/sounds', exist_ok=True)
        
        # 加载音频文件
        print(f"Loading audio file: {input_file}")
        audio = AudioFileClip(input_file)
        
        # 遍历时间戳并分割音频
        for name, (start_sec, duration_sec) in timestamps.items():
            try:
                print(f"Processing {name}: {start_sec}s to {start_sec + duration_sec}s")
                
                # 提取片段
                segment = audio.subclip(start_sec, start_sec + duration_sec)
                
                # 导出为mp3文件
                output_path = os.path.join('static/sounds', f"{name}.mp3")
                segment.write_audiofile(output_path, 
                                     codec='libmp3lame',
                                     bitrate='192k',
                                     verbose=False,
                                     logger=None)
                print(f"Successfully exported: {output_path}")
                
            except Exception as e:
                print(f"Error processing {name}: {str(e)}")
        
        # 清理资源
        audio.close()
                
    except Exception as e:
        print(f"Error processing audio file: {str(e)}")

# 时间戳（秒）
timestamps = {
    "move": (0, 0.1),      # 移动音效 - 短促的滑动声
    "rotate": (0.2, 0.1),  # 旋转音效 - 短促的旋转声
    "drop": (0.4, 0.2),    # 下落音效 - 稍长的撞击声
    "clear": (0.7, 0.3),   # 消行音效 - 较长的清除声
    "gameover": (1.1, 0.5) # 游戏结束音效 - 最长的结束音效
}

if __name__ == "__main__":
    # 音频文件路径
    input_file = '/Users/hardy/senior/Python/project/Yule/source/static_music.mp3'
    
    # 检查文件是否存在
    if not os.path.exists(input_file):
        print(f"Error: Audio file not found at {input_file}")
    else:
        split_audio(input_file, timestamps) 