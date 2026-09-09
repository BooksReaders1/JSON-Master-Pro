// JSON 查询模块 (JSONPath + JMESPath)
(function() {
    const QueryModule = {
        name: '查询过滤',
        icon: 'fa-search',
        
        init: function(container) {
            container.innerHTML = `
                <div class="flex flex-col h-full gap-4">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-bold text-white">JSON 查询 (JSONPath / JMESPath)</h3>
                        <button id="query-run" class="btn-primary"><i class="fas fa-play"></i> 执行查询</button>
                    </div>
                    <div class="flex gap-2 items-center">
                        <label class="text-sm text-gray-400">语法:</label>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="query-syntax" value="jsonpath" checked class="accent-blue-500">
                            <span class="text-sm">JSONPath</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="query-syntax" value="jmespath" class="accent-blue-500">
                            <span class="text-sm">JMESPath</span>
                        </label>
                    </div>
                    <div class="flex gap-2">
                        <input type="text" id="query-expression" class="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500" placeholder="输入查询表达式，如 $.store.book[*].author">
                        <button id="query-insert-sample" class="btn-secondary text-xs px-3"><i class="fas fa-code"></i> 示例</button>
                    </div>
                    <div class="grid grid-cols-2 gap-4 flex-1 min-h-0">
                        <div class="flex flex-col">
                            <label class="text-xs text-gray-400 mb-2">输入 JSON</label>
                            <textarea id="query-input" class="editor-box flex-1" placeholder="输入 JSON 数据"></textarea>
                        </div>
                        <div class="flex flex-col">
                            <label class="text-xs text-gray-400 mb-2">查询结果</label>
                            <textarea id="query-output" class="editor-box flex-1" readonly></textarea>
                        </div>
                    </div>
                </div>
            `;

            document.getElementById('query-run').onclick = () => this.execute();
            document.getElementById('query-insert-sample').onclick = () => this.insertSample();
        },

        activate: function(input) {
            if (input && !document.getElementById('query-input').value) {
                document.getElementById('query-input').value = input;
            }
        },

        execute: function() {
            const inputStr = document.getElementById('query-input').value;
            const expression = document.getElementById('query-expression').value.trim();
            const outputEl = document.getElementById('query-output');
            const syntax = document.querySelector('input[name="query-syntax"]:checked').value;

            if (!inputStr || !expression) {
                showToast('请输入 JSON 和查询表达式', 'warning');
                return;
            }

            const data = JSONUtils.parse(inputStr);
            if (data === null) {
                showToast('无效的 JSON', 'error');
                return;
            }

            try {
                let result;
                if (syntax === 'jsonpath') {
                    if (typeof JSONPath === 'undefined') {
                        showToast('JSONPath 库未加载', 'error');
                        return;
                    }
                    result = JSONPath({ path: expression, json: data });
                } else {
                    if (typeof jmespath === 'undefined') {
                        showToast('JMESPath 库未加载', 'error');
                        return;
                    }
                    result = jmespath.search(data, expression);
                }

                outputEl.value = JSON.stringify(result, null, 2);
                
                const resultType = Array.isArray(result) ? `Array(${result.length})` : typeof result;
                showToast(`查询成功 (${resultType})`, 'success');
            } catch (e) {
                outputEl.value = '';
                showToast('查询错误：' + e.message, 'error');
            }
        },

        insertSample: function() {
            const syntax = document.querySelector('input[name="query-syntax"]:checked').value;
            const inputEl = document.getElementById('query-expression');
            
            if (syntax === 'jsonpath') {
                inputEl.value = '$.store.book[*].author';
            } else {
                inputEl.value = 'people[*].name';
            }
            showToast('已插入示例表达式', 'info');
        }
    };

    if (window.AppInstance) {
        window.AppInstance.register('query', QueryModule);
    }
})();
