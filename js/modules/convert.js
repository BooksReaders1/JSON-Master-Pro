// 转换模块 (JSON <-> String)
(function() {
    const ConvertModule = {
        name: 'String 转换',
        icon: 'fa-exchange-alt',
        
        init: function(container) {
            container.innerHTML = `
                <div class="flex flex-col h-full gap-4">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-bold text-white">JSON ⇄ String 转换</h3>
                        <div class="flex gap-2">
                            <button id="conv-swap" class="btn-secondary"><i class="fas fa-retweet"></i> 切换方向</button>
                            <button id="conv-run" class="btn-primary"><i class="fas fa-play"></i> 转换</button>
                            <button id="conv-copy" class="btn-secondary"><i class="fas fa-copy"></i> 复制</button>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4 flex-1 min-h-0">
                        <div class="flex flex-col">
                            <label id="conv-left-label" class="text-xs text-gray-400 mb-2">输入 JSON</label>
                            <textarea id="conv-left" class="editor-box flex-1" placeholder="输入 JSON 或字符串"></textarea>
                        </div>
                        <div class="flex flex-col">
                            <label id="conv-right-label" class="text-xs text-gray-400 mb-2">输出结果</label>
                            <textarea id="conv-right" class="editor-box flex-1" readonly></textarea>
                        </div>
                    </div>
                </div>
            `;

            this.direction = 'json-to-string';
            
            document.getElementById('conv-swap').onclick = () => this.swap();
            document.getElementById('conv-run').onclick = () => this.convert();
            document.getElementById('conv-copy').onclick = () => this.copy();
        },

        activate: function(input) {
            if (input && !document.getElementById('conv-left').value) {
                document.getElementById('conv-left').value = input;
            }
        },

        swap: function() {
            const left = document.getElementById('conv-left');
            const right = document.getElementById('conv-right');
            const temp = left.value;
            left.value = right.value;
            right.value = temp;

            this.direction = this.direction === 'json-to-string' ? 'string-to-json' : 'json-to-string';
            this.updateLabels();
        },

        updateLabels: function() {
            const leftLabel = document.getElementById('conv-left-label');
            const rightLabel = document.getElementById('conv-right-label');
            
            if (this.direction === 'json-to-string') {
                leftLabel.textContent = '输入 JSON';
                rightLabel.textContent = '输出字符串';
            } else {
                leftLabel.textContent = '输入字符串';
                rightLabel.textContent = '输出 JSON';
            }
        },

        convert: function() {
            const input = document.getElementById('conv-left').value;
            const outputEl = document.getElementById('conv-right');

            if (!input.trim()) {
                showToast('请输入内容', 'warning');
                return;
            }

            if (this.direction === 'json-to-string') {
                const parsed = JSONUtils.parse(input);
                if (parsed === null) {
                    showToast('无效的 JSON', 'error');
                    return;
                }
                // 转字符串：带引号，可嵌入代码
                outputEl.value = JSON.stringify(input).slice(1, -1); // 去掉外层引号
                showToast('转换成功', 'success');
            } else {
                // 字符串转 JSON：尝试解析
                try {
                    // 先尝试直接解析
                    let parsed = JSONUtils.parse(input);
                    if (parsed === null) {
                        // 尝试加上引号解析
                        parsed = JSONUtils.parse(`"${input}"`);
                    }
                    if (parsed === null) {
                        // 尝试作为 JSON 对象解析
                        parsed = JSONUtils.parse(input);
                    }
                    if (parsed !== null) {
                        outputEl.value = JSON.stringify(parsed, null, 2);
                        showToast('转换成功', 'success');
                    } else {
                        outputEl.value = input;
                        showToast('无法解析为 JSON，保持原样', 'warning');
                    }
                } catch (e) {
                    outputEl.value = input;
                    showToast('转换失败', 'error');
                }
            }
        },

        copy: function() {
            const output = document.getElementById('conv-right');
            output.select();
            document.execCommand('copy');
            showToast('已复制', 'success');
        }
    };

    if (window.AppInstance) {
        window.AppInstance.register('convert', ConvertModule);
    }
})();
