def clean_csw19_file():
    with open('source/csw19.txt', 'r', encoding='utf-8') as file:
        lines = file.readlines()
    
    # 过滤掉包含 "Letters Scrabble US words with" 的行和其后的空行
    cleaned_lines = []
    skip_next = False
    for line in lines:
        if 'Letters Scrabble US words with' in line:
            skip_next = True
            continue
        if skip_next and line.strip() == '':
            skip_next = False
            continue
        cleaned_lines.append(line)
    
    # 写回文件
    with open('source/csw19.txt', 'w', encoding='utf-8') as file:
        file.writelines(cleaned_lines)

# 执行清理
clean_csw19_file()