// 页面初始化
document.addEventListener('DOMContentLoaded', () => {
    // 加载导航栏和页脚
    loadComponents();
    // 初始化编辑器
    initEditor();
    // 恢复上次编辑内容
    restoreContent();
});

// 加载组件
async function loadComponents() {
    try {
        // 加载导航栏
        const navResponse = await fetch('components/nav.html');
        const navHtml = await navResponse.text();
        document.querySelector('.nav-bar').innerHTML = navHtml;

        // 加载页脚
        const footerResponse = await fetch('components/footer.html');
        const footerHtml = await footerResponse.text();
        document.querySelector('.footer').innerHTML = footerHtml;

        // 初始化主题
        ThemeManager.init();
    } catch (error) {
        console.error('加载组件失败:', error);
        Toast.show('加载页面组件失败，请刷新重试', 'error');
    }
}

// 初始化编辑器
function initEditor() {
    const input = document.getElementById('input');
    const output = document.getElementById('output');

    // 输入监听
    input.addEventListener('input', debounce(() => {
        updateWordCount(input);
        autoProcess();
        saveContent();
    }, 300));

    // 自动调整高度
    input.addEventListener('input', () => {
        adjustTextareaHeight(input);
    });

    // 初始化字数统计
    updateWordCount(input);
}

// 更新字数统计
function updateWordCount(textarea) {
    const text = textarea.value;
    const count = text.replace(/\s/g, '').length;
    const wordCount = textarea.parentElement.querySelector('.word-count');
    wordCount.textContent = `${count} 字`;
}

// 自动调整文本框高度
function adjustTextareaHeight(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

// 自动处理文本
function autoProcess() {
    if (document.getElementById('autoProcess')?.checked) {
        processText();
    }
}

// 保存内容到本地存储
function saveContent() {
    const input = document.getElementById('input');
    const output = document.getElementById('output');
    const options = getOptions();
    
    StorageUtils.set('markdown_content', {
        input: input.value,
        output: output.value,
        options: options
    });
}

// 恢复保存的内容
function restoreContent() {
    const saved = StorageUtils.get('markdown_content');
    if (saved) {
        const input = document.getElementById('input');
        const output = document.getElementById('output');
        
        input.value = saved.input || '';
        output.value = saved.output || '';
        
        // 恢复选项
        if (saved.options) {
            Object.entries(saved.options).forEach(([key, value]) => {
                const checkbox = document.getElementById(key);
                if (checkbox) {
                    checkbox.checked = value;
                }
            });
        }

        updateWordCount(input);
    }
}

// 获取清理选项
function getOptions() {
    return {
        removeLineBreaks: document.getElementById('removeLineBreaks').checked,
        removeSpaces: document.getElementById('removeSpaces').checked,
        convertPunctuation: document.getElementById('convertPunctuation').checked
    };
}

// 处理文本
async function processText() {
    const input = document.getElementById('input');
    const output = document.getElementById('output');
    const options = getOptions();
    
    try {
        Loading.show('正在处理...');
        
        let text = input.value;
        
        // 移除多余换行
        if (options.removeLineBreaks) {
            text = text.replace(/\n{3,}/g, '\n\n')
                      .replace(/([。！？）】」》}\]"])\n/g, '$1')
                      .replace(/\n([（【「《{\["'])/g, '$1');
        }
        
        // 移除多余空格
        if (options.removeSpaces) {
            text = text.replace(/[ 　]+/g, ' ')
                      .replace(/([。！？）】」》}\]"])[ 　]+/g, '$1')
                      .replace(/[ 　]+([（【「《{\["'])/g, '$1');
        }
        
        // 转换标点符号
        if (options.convertPunctuation) {
            const punctMap = {
                ',': '，',
                '.': '。',
                '?': '？',
                '!': '！',
                ':': '：',
                ';': '；',
                '(': '（',
                ')': '）',
                '[': '【',
                ']': '】',
                '{': '「',
                '}': '」'
            };
            
            text = text.replace(/[,.?!:;()\[\]{}]/g, match => punctMap[match] || match);
        }
        
        output.value = text.trim();
        Toast.show('处理完成', 'success');
    } catch (error) {
        console.error('处理文本失败:', error);
        Toast.show('处理失败，请重试', 'error');
    } finally {
        Loading.hide();
    }
}

// 复制输出内容
async function copyOutput() {
    const output = document.getElementById('output');
    
    if (!output.value.trim()) {
        Toast.show('没有可复制的内容', 'warning');
        return;
    }
    
    try {
        await navigator.clipboard.writeText(output.value);
        Toast.show('已复制到剪贴板', 'success');
    } catch (error) {
        console.error('复制失败:', error);
        Toast.show('复制失败，请手动复制', 'error');
    }
}

// 从剪贴板粘贴
async function pasteFromClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        document.getElementById('input').value = text;
        updateWordCount(document.getElementById('input'));
        processText();
    } catch (error) {
        console.error('粘贴失败:', error);
        Toast.show('粘贴失败，请手动粘贴', 'error');
    }
}

// 从文件导入
function loadFromFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.md';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            Loading.show('正在读取文件...');
            const text = await file.text();
            document.getElementById('input').value = text;
            updateWordCount(document.getElementById('input'));
            processText();
            Toast.show('文件导入成功', 'success');
        } catch (error) {
            console.error('读取文件失败:', error);
            Toast.show('读取文件失败', 'error');
        } finally {
            Loading.hide();
        }
    };
    
    input.click();
}

// 清空输入
function clearInput() {
    const input = document.getElementById('input');
    const output = document.getElementById('output');
    
    if (!input.value.trim() && !output.value.trim()) {
        Toast.show('已经是空的了', 'info');
        return;
    }
    
    if (confirm('确定要清空所有内容吗？')) {
        input.value = '';
        output.value = '';
        updateWordCount(input);
        Toast.show('已清空', 'success');
    }
} 