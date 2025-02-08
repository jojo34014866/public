/**
 * 工具函数集合
 */

/**
 * 主题管理器
 */
const ThemeManager = {
    // 主题类型
    THEMES: {
        LIGHT: 'light',
        DARK: 'dark'
    },

    // 初始化主题
    init() {
        // 获取保存的主题或系统主题
        const savedTheme = localStorage.getItem('theme');
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 
            this.THEMES.DARK : this.THEMES.LIGHT;
        
        // 应用主题
        this.setTheme(savedTheme || systemTheme);
        
        // 监听系统主题变化
        window.matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', e => {
                if (!localStorage.getItem('theme')) {
                    this.setTheme(e.matches ? this.THEMES.DARK : this.THEMES.LIGHT);
                }
            });
    },

    // 切换主题
    toggle() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === this.THEMES.DARK ? 
            this.THEMES.LIGHT : this.THEMES.DARK;
        this.setTheme(newTheme);
    },

    // 设置主题
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // 更新主题图标
        const themeIcon = document.querySelector('#themeToggle .theme-icon');
        if (themeIcon) {
            themeIcon.textContent = theme === this.THEMES.DARK ? '☀️' : '🌙';
        }
    }
};

/**
 * 存储工具
 */
const StorageUtils = {
    // 设置带过期时间的数据
    set(key, value, expires = 24 * 60 * 60 * 1000) {
        const item = {
            value,
            expires: Date.now() + expires
        };
        localStorage.setItem(key, JSON.stringify(item));
    },

    // 获取数据
    get(key) {
        const item = localStorage.getItem(key);
        if (!item) return null;

        const { value, expires } = JSON.parse(item);
        if (Date.now() > expires) {
            localStorage.removeItem(key);
            return null;
        }
        return value;
    },

    // 删除数据
    remove(key) {
        localStorage.removeItem(key);
    },

    // 清空所有数据
    clear() {
        localStorage.clear();
    }
};

/**
 * 文件工具
 */
const FileUtils = {
    // 格式化文件大小
    formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // 获取文件扩展名
    getExtension(filename) {
        return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
    },

    // 检查文件类型
    isImage(file) {
        return file.type.startsWith('image/');
    },

    // 读取文件为 DataURL
    readAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
};

/**
 * UI 工具
 */
const UIUtils = {
    // 防抖
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // 节流
    throttle(func, limit = 300) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // 复制到剪贴板
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            Toast.show('已复制到剪贴板', 'success');
        } catch (err) {
            console.error('复制失败:', err);
            Toast.show('复制失败，请手动复制', 'error');
        }
    },

    // 下载文件
    download(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

/**
 * 日期工具
 */
const DateUtils = {
    // 格式化日期
    format(date, format = 'YYYY-MM-DD HH:mm:ss') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');

        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    },

    // 相对时间
    fromNow(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}天前`;
        if (hours > 0) return `${hours}小时前`;
        if (minutes > 0) return `${minutes}分钟前`;
        return '刚刚';
    }
};

// 导出工具
export {
    ThemeManager,
    UIUtils,
    FileUtils,
    StorageUtils,
    DateUtils
}; 