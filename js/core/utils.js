/**
 * 核心工具函数
 */

const Utils = {
    /**
     * 计算 JSON 深度
     */
    calculateDepth(value, currentDepth = 0) {
        if (value === null || typeof value !== 'object') return currentDepth;
        let maxDepth = currentDepth + 1;
        if (Array.isArray(value)) {
            value.forEach(v => {
                const d = this.calculateDepth(v, currentDepth + 1);
                if (d > maxDepth) maxDepth = d;
            });
        } else {
            for (const key in value) {
                const d = this.calculateDepth(value[key], currentDepth + 1);
                if (d > maxDepth) maxDepth = d;
            }
        }
        return maxDepth;
    },
    
    /**
     * 统计键值对数量
     */
    countKeys(obj) {
        let count = 0;
        const recurse = (x) => {
            if (x && typeof x === 'object') {
                for (const k in x) {
                    count++;
                    recurse(x[k]);
                }
            }
        };
        recurse(obj);
        return count;
    },
    
    /**
     * 格式化字节大小
     */
    formatBytes(bytes) {
        if (!+bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
    },
    
    /**
     * 统计 Null 值数量
     */
    countNulls(value) {
        if (value === null) return 1;
        if (typeof value !== 'object') return 0;
        let count = 0;
        if (Array.isArray(value)) {
            value.forEach(v => count += this.countNulls(v));
        } else {
            for (const key in value) {
                count += this.countNulls(value[key]);
            }
        }
        return count;
    },
    
    /**
     * 查找重复值
     */
    findDuplicates(value, seen = new Map(), duplicates = new Set()) {
        if (value === null || typeof value !== 'object') {
            const key = JSON.stringify(value);
            if (seen.has(key)) {
                duplicates.add(key);
            } else {
                seen.set(key, true);
            }
            return duplicates;
        }
        if (Array.isArray(value)) {
            value.forEach(v => this.findDuplicates(v, seen, duplicates));
        } else {
            for (const key in value) {
                this.findDuplicates(value[key], seen, duplicates);
            }
        }
        return duplicates;
    },
    
    /**
     * 获取类型分布
     */
    getTypeDistribution(value, types = {}) {
        const type = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
        types[type] = (types[type] || 0) + 1;
        if (value !== null && typeof value === 'object') {
            if (Array.isArray(value)) {
                value.forEach(v => this.getTypeDistribution(v, types));
            } else {
                for (const key in value) {
                    this.getTypeDistribution(value[key], types);
                }
            }
        }
        return types;
    },
    
    /**
     * 防抖函数
     */
    debounce(func, wait) {
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
    
    /**
     * 安全解析 JSON
     */
    safeJsonParse(str) {
        try {
            return { success: true, data: JSON.parse(str) };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }
};
