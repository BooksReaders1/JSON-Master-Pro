// 格式化模块
(function() {
    const FormatModule = {
        name: '格式化',
        icon: 'fa-code',
        
        init: function(container) {
            container.innerHTML = `
                <div class="flex-1 flex flex-col md:flex-row overflow-hidden">
                    <section class="w-full md:w-1/2 flex flex-col border-r border-slate-700 p-4 gap-3">
                        <div class="flex justify-between items-center">
                            <label class="text-xs uppercase tracking-wider text-slate-400 font-semibold">原始 JSON</label>
                            <button onclick="FormatModule.loadSample()" class="text-xs text-blue-400 hover:text-blue-300">加载示例</button>
                        </div>
                        <textarea id="fmtInput" class="flex-1 w-full bg-slate-800 text-slate-200 p-4 rounded-lg border border-slate-700 focus:border-blue-500 outline-none text-sm leading-relaxed editor-box" placeholder="粘贴 JSON..."></textarea>
                        <div class="flex gap-2">
                            <button onclick="FormatModule.doFormat()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded">格式化</button>
                            <button onclick="FormatModule.minify()" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded">压缩</button>
                        </div>
                    </section>
                    <section class="w-full md:w-1/2 flex flex-col p-4 gap-2 bg-slate-900/50">
                        <label class="text-xs uppercase tracking-wider text-slate-400 font-semibold">输出</label>
                        <pre id="fmtOutput" class="flex-1 overflow-auto bg-slate-800 rounded-lg border border-slate-700 p-4 text-sm whitespace-pre-wrap break-all"></pre>
                    </section>
                </div>
            `;
        },

        activate: function(inputData) {
            const inputEl = document.getElementById('fmtInput');
            if (inputEl && !inputEl.value && inputData) {
                inputEl.value = inputData;
            }
        },

        doFormat: function() {
            const inputEl = document.getElementById('fmtInput');
            const outputEl = document.getElementById('fmtOutput');
            if (!inputEl || !outputEl) return;
            
            const result = Utils.parseJSON(inputEl.value);
            if (!result.success) {
                showToast(result.error, 'error');
                outputEl.textContent = '';
                return;
            }
            
            App.globalInput = inputEl.value;
            outputEl.textContent = JSON.stringify(result.data, null, 2);
            showToast('格式化成功', 'success');
        },

        minify: function() {
            const inputEl = document.getElementById('fmtInput');
            const outputEl = document.getElementById('fmtOutput');
            if (!inputEl || !outputEl) return;
            
            const result = Utils.parseJSON(inputEl.value);
            if (!result.success) {
                showToast(result.error, 'error');
                return;
            }
            
            App.globalInput = inputEl.value;
            outputEl.textContent = JSON.stringify(result.data);
            showToast('压缩成功', 'success');
        },

        loadSample: function() {
            const sample = {"name":"JSON Master","version":1.0,"features":["format","tree","compare"],"active":true};
            const inputEl = document.getElementById('fmtInput');
            if (inputEl) {
                inputEl.value = JSON.stringify(sample, null, 2);
                this.doFormat();
            }
        }
    };

    window.FormatModule = FormatModule;
    if (window.App) App.register('format', FormatModule);
})();
