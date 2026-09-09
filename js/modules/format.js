// 格式化模块
(function() {
    const FormatModule = {
        name: '格式化',
        icon: 'fa-code',
        
        init: function(container) {
            container.innerHTML = `
                <div class="flex flex-col h-full gap-4">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-bold text-white">JSON 格式化</h3>
                        <div class="flex gap-2">
                            <button id="fmt-beautify" class="btn-primary"><i class="fas fa-magic"></i> 美化</button>
                            <button id="fmt-minify" class="btn-secondary"><i class="fas fa-compress"></i> 压缩</button>
                            <button id="fmt-copy" class="btn-secondary"><i class="fas fa-copy"></i> 复制</button>
                        </div>
                    </div>
                    <textarea id="fmt-output" class="editor-box flex-1" readonly placeholder="输出结果"></textarea>
                </div>
            `;

            document.getElementById('fmt-beautify').onclick = () => this.beautify();
            document.getElementById('fmt-minify').onclick = () => this.minify();
            document.getElementById('fmt-copy').onclick = () => this.copy();
        },

        activate: function(input) {
            this.input = input;
        },

        beautify: function() {
            const parsed = JSONUtils.parse(this.input);
            if (parsed === null) {
                showToast('无效的 JSON 格式', 'error');
                return;
            }
            document.getElementById('fmt-output').value = JSON.stringify(parsed, null, 2);
            showToast('格式化成功', 'success');
        },

        minify: function() {
            const parsed = JSONUtils.parse(this.input);
            if (parsed === null) {
                showToast('无效的 JSON 格式', 'error');
                return;
            }
            document.getElementById('fmt-output').value = JSON.stringify(parsed);
            showToast('压缩成功', 'success');
        },

        copy: function() {
            const output = document.getElementById('fmt-output');
            output.select();
            document.execCommand('copy');
            showToast('已复制到剪贴板', 'success');
        }
    };

    if (window.AppInstance) {
        window.AppInstance.register('format', FormatModule);
    }
})();
