// 性能分析模块
(function() {
    const AnalyzeModule = {
        name: '性能分析',
        icon: 'fa-chart-bar',
        
        init: function(container) {
            container.innerHTML = `
                <div class="flex flex-col h-full gap-4">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-bold text-white">JSON 性能与结构分析</h3>
                        <button id="analyze-run" class="btn-primary"><i class="fas fa-play"></i> 开始分析</button>
                    </div>
                    <div id="analyze-stats" class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <!-- 统计卡片由 JS 动态生成 -->
                    </div>
                    <div class="grid grid-cols-2 gap-4 flex-1 min-h-0">
                        <div class="bg-gray-800 rounded-lg p-4 overflow-auto">
                            <h4 class="text-sm font-bold text-white mb-3">类型分布</h4>
                            <div id="analyze-types" class="space-y-2"></div>
                        </div>
                        <div class="bg-gray-800 rounded-lg p-4 overflow-auto">
                            <h4 class="text-sm font-bold text-white mb-3">详细信息</h4>
                            <div id="analyze-details" class="text-sm text-gray-300 space-y-1"></div>
                        </div>
                    </div>
                </div>
            `;

            document.getElementById('analyze-run').onclick = () => this.analyze();
        },

        activate: function(input) {
            this.input = input;
        },

        analyze: function() {
            const parsed = JSONUtils.parse(this.input);
            if (parsed === null) {
                showToast('无效的 JSON', 'error');
                return;
            }

            const startTime = performance.now();
            
            // 基础统计
            const size = new Blob([this.input]).size;
            const keyCount = JSONUtils.countKeys(parsed);
            const depth = JSONUtils.getDepth(parsed);
            const nullCount = JSONUtils.countNulls(parsed);
            
            // 类型统计
            const typeStats = this.countTypes(parsed);
            
            const endTime = performance.now();
            const parseTime = (endTime - startTime).toFixed(2);

            // 渲染统计卡片
            this.renderStats(size, keyCount, depth, nullCount, parseTime);
            
            // 渲染类型分布
            this.renderTypeStats(typeStats);
            
            // 渲染详细信息
            this.renderDetails(parsed, size);

            showToast('分析完成', 'success');
        },

        countTypes: function(obj, stats = {}) {
            if (obj === null) {
                stats.null = (stats.null || 0) + 1;
                return stats;
            }
            
            const type = Array.isArray(obj) ? 'array' : typeof obj;
            stats[type] = (stats[type] || 0) + 1;

            if (typeof obj === 'object' && obj !== null) {
                const values = Array.isArray(obj) ? obj : Object.values(obj);
                for (const v of values) {
                    this.countTypes(v, stats);
                }
            }

            return stats;
        },

        renderStats: function(size, keys, depth, nulls, time) {
            const container = document.getElementById('analyze-stats');
            const cards = [
                { label: '文件大小', value: this.formatSize(size), icon: 'fa-database', color: 'text-blue-400' },
                { label: '键值对数量', value: keys, icon: 'fa-key', color: 'text-green-400' },
                { label: '最大深度', value: depth, icon: 'fa-layer-group', color: 'text-yellow-400' },
                { label: 'Null 值数量', value: nulls, icon: 'fa-circle', color: 'text-red-400' },
                { label: '解析时间', value: `${time}ms`, icon: 'fa-stopwatch', color: 'text-purple-400' }
            ];

            container.innerHTML = cards.map(card => `
                <div class="bg-gray-800 rounded-lg p-4 flex items-center gap-3">
                    <i class="fas ${card.icon} ${card.color} text-2xl"></i>
                    <div>
                        <div class="text-xs text-gray-400">${card.label}</div>
                        <div class="text-lg font-bold text-white">${card.value}</div>
                    </div>
                </div>
            `).join('');
        },

        renderTypeStats: function(stats) {
            const container = document.getElementById('analyze-types');
            const total = Object.values(stats).reduce((a, b) => a + b, 0);
            
            const colors = {
                object: 'bg-blue-500',
                array: 'bg-green-500',
                string: 'bg-yellow-500',
                number: 'bg-purple-500',
                boolean: 'bg-pink-500',
                null: 'bg-red-500'
            };

            container.innerHTML = Object.entries(stats).map(([type, count]) => {
                const percent = ((count / total) * 100).toFixed(1);
                return `
                    <div class="flex items-center gap-2">
                        <div class="w-20 text-xs text-gray-400">${type}</div>
                        <div class="flex-1 bg-gray-700 rounded-full h-2">
                            <div class="${colors[type] || 'bg-gray-500'} h-2 rounded-full" style="width: ${percent}%"></div>
                        </div>
                        <div class="w-16 text-xs text-gray-300 text-right">${count} (${percent}%)</div>
                    </div>
                `;
            }).join('');
        },

        renderDetails: function(parsed, size) {
            const container = document.getElementById('analyze-details');
            const isArray = Array.isArray(parsed);
            const topKeys = isArray ? [] : Object.keys(parsed).slice(0, 10);
            
            let html = `
                <div class="mb-3"><span class="text-gray-400">根节点类型:</span> <span class="text-white">${isArray ? 'Array' : 'Object'}</span></div>
                <div class="mb-3"><span class="text-gray-400">顶层元素数:</span> <span class="text-white">${isArray ? parsed.length : Object.keys(parsed).length}</span></div>
            `;

            if (!isArray && topKeys.length > 0) {
                html += `<div class="mb-3"><span class="text-gray-400">顶层键名:</span><div class="mt-1 text-xs text-gray-300">${topKeys.join(', ')}</div></div>`;
            }

            // 重复值检测 (简单版)
            const stringValues = [];
            this.collectStrings(parsed, stringValues);
            const duplicates = this.findDuplicates(stringValues);
            if (duplicates.length > 0) {
                html += `<div class="mb-3"><span class="text-gray-400">重复字符串值:</span><div class="mt-1 text-xs text-gray-300">${duplicates.slice(0, 5).join(', ')}${duplicates.length > 5 ? '...' : ''}</div></div>`;
            }

            container.innerHTML = html;
        },

        collectStrings: function(obj, arr) {
            if (typeof obj === 'string') {
                arr.push(obj);
                return;
            }
            if (obj !== null && typeof obj === 'object') {
                const values = Array.isArray(obj) ? obj : Object.values(obj);
                values.forEach(v => this.collectStrings(v, arr));
            }
        },

        findDuplicates: function(arr) {
            const counts = {};
            arr.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
            return Object.entries(counts)
                .filter(([_, c]) => c > 1)
                .map(([v, _]) => v)
                .slice(0, 10);
        },

        formatSize: function(bytes) {
            if (bytes < 1024) return bytes + ' B';
            if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
            return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        }
    };

    if (window.AppInstance) {
        window.AppInstance.register('analyze', AnalyzeModule);
    }
})();
