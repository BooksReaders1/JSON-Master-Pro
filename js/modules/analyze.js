/**
 * 性能分析模块
 * JSON 大小统计、深度分析、重复值检测等
 */

const AnalyzeModule = {
    elements: {},
    
    init(els) {
        this.elements = {
            input: document.getElementById('analyzeInput'),
            result: document.getElementById('analyzeResult')
        };
        
        console.log('[AnalyzeModule] Initialized');
    },
    
    doAnalyze() {
        const src = this.elements.input.value.trim();
        
        if (!src) {
            this.elements.result.innerHTML = this.buildEmptyState();
            return;
        }
        
        App.withLoading('分析中...', () => {
            try {
                const startTime = performance.now();
                const data = JSON.parse(src);
                const parseTime = performance.now() - startTime;
                
                // Calculate metrics
                const sizeBytes = new Blob([src]).size;
                const keyCount = Utils.countKeys(data);
                const maxDepth = Utils.calculateDepth(data);
                const nullCount = Utils.countNulls(data);
                const duplicates = Utils.findDuplicates(data);
                const typeDist = Utils.getTypeDistribution(data);
                
                // Build results
                const results = [
                    { label: '解析时间', value: `${parseTime.toFixed(2)} ms`, icon: 'fa-stopwatch', color: 'text-blue-400' },
                    { label: '文件大小', value: Utils.formatBytes(sizeBytes), icon: 'fa-database', color: 'text-emerald-400' },
                    { label: '键值对数量', value: keyCount.toString(), icon: 'fa-key', color: 'text-purple-400' },
                    { label: '最大深度', value: maxDepth.toString(), icon: 'fa-layer-group', color: 'text-amber-400' },
                    { label: 'Null 值数量', value: nullCount.toString(), icon: 'fa-circle', color: 'text-slate-400' },
                    { label: '重复值数量', value: duplicates.size.toString(), icon: 'fa-copy', color: 'text-red-400' }
                ];
                
                // Build type distribution HTML
                let typeHtml = '';
                for (const [type, count] of Object.entries(typeDist)) {
                    typeHtml += `<span class="inline-flex items-center gap-1 px-2 py-1 bg-slate-700 rounded text-[10px] text-slate-300">${type}: ${count}</span>`;
                }
                
                let html = '<div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">';
                results.forEach(r => {
                    html += `
                        <div class="bg-slate-800/80 rounded-lg p-3 border border-slate-700 hover:border-slate-600 transition">
                            <div class="flex items-center gap-2 mb-1">
                                <i class="fa-solid ${r.icon} ${r.color}"></i>
                                <span class="text-slate-400 text-xs">${r.label}</span>
                            </div>
                            <div class="text-lg font-bold text-white">${r.value}</div>
                        </div>
                    `;
                });
                html += '</div>';
                
                // Type distribution
                html += `
                    <div class="bg-slate-800/80 rounded-lg p-3 border border-slate-700 mb-3">
                        <h4 class="text-xs font-bold text-slate-300 mb-2">
                            <i class="fa-solid fa-chart-pie mr-1"></i>类型分布
                        </h4>
                        <div class="flex flex-wrap gap-2">${typeHtml || '<span class="text-slate-500 text-xs">无数据</span>'}</div>
                    </div>
                `;
                
                // Duplicate details (if not too many)
                if (duplicates.size > 0 && duplicates.size <= 10) {
                    html += `
                        <div class="bg-slate-800/80 rounded-lg p-3 border border-slate-700">
                            <h4 class="text-xs font-bold text-slate-300 mb-2">
                                <i class="fa-solid fa-triangle-exclamation text-amber-400 mr-1"></i>重复值详情
                            </h4>
                            <div class="text-xs text-slate-400 space-y-1">
                    `;
                    duplicates.forEach(d => {
                        const val = d.length > 50 ? d.substring(0, 50) + '...' : d;
                        html += `<div class="truncate">• ${val}</div>`;
                    });
                    html += '</div></div>';
                } else if (duplicates.size > 10) {
                    html += `
                        <div class="bg-slate-800/80 rounded-lg p-3 border border-slate-700">
                            <p class="text-xs text-slate-400">
                                <i class="fa-solid fa-info-circle mr-1"></i>
                                共有 ${duplicates.size} 个重复值（超过 10 个不显示详情）
                            </p>
                        </div>
                    `;
                }
                
                this.elements.result.innerHTML = html;
                showToast('分析完成', 'success');
            } catch (e) {
                this.elements.result.innerHTML = `
                    <div class="bg-red-900/30 rounded-lg p-3 border border-red-700">
                        <p class="text-red-400 text-xs">
                            <i class="fa-solid fa-circle-exclamation mr-1"></i>${e.message}
                        </p>
                    </div>
                `;
                showToast(e.message, 'error');
            }
        });
    },
    
    buildEmptyState() {
        return `
            <div class="bg-slate-800/50 rounded-lg p-6 border border-slate-700 text-center">
                <i class="fa-solid fa-chart-simple text-4xl text-slate-600 mb-3"></i>
                <p class="text-slate-500 text-sm">请输入 JSON 数据进行性能分析</p>
            </div>
        `;
    },
    
    loadSample() {
        const sample = {
            "users": [
                {"id": 1, "name": "Alice", "email": "alice@example.com", "age": 25, "active": true},
                {"id": 2, "name": "Bob", "email": "bob@example.com", "age": 30, "active": false},
                {"id": 3, "name": "Charlie", "email": "charlie@example.com", "age": 35, "active": true, "metadata": null}
            ],
            "config": {
                "theme": "dark",
                "language": "zh-CN",
                "notifications": true
            },
            "stats": {"total": 100, "active": 75, "inactive": 25}
        };
        
        this.elements.input.value = JSON.stringify(sample, null, 4);
        this.doAnalyze();
    },
    
    getContentForCopy() {
        return this.elements.input?.value || '';
    },
    
    onActivate() {
        if (this.elements.input?.value.trim()) {
            this.doAnalyze();
        }
    },
    
    onSync(value) {
        if (this.elements.input) {
            this.elements.input.value = value;
            // Auto-analyze after short delay
            setTimeout(() => this.doAnalyze(), 500);
        }
    }
};

// Register module
App.registerModule('analyze', AnalyzeModule);

// Global functions
window.doAnalyze = () => AnalyzeModule.doAnalyze();
window.loadAnalyzeSample = () => AnalyzeModule.loadSample();
