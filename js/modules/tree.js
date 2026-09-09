// 树视图模块
(function() {
    const TreeModule = {
        name: '树视图',
        icon: 'fa-sitemap',
        
        init: function(container) {
            container.innerHTML = `
                <div class="flex flex-col h-full gap-4">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-bold text-white">JSON 树形视图</h3>
                        <div class="flex gap-2">
                            <button id="tree-expand" class="btn-secondary"><i class="fas fa-plus"></i> 全部展开</button>
                            <button id="tree-collapse" class="btn-secondary"><i class="fas fa-minus"></i> 全部收起</button>
                        </div>
                    </div>
                    <div id="tree-container" class="flex-1 bg-gray-800 rounded-lg p-4 overflow-auto font-mono text-sm text-gray-300"></div>
                </div>
            `;

            document.getElementById('tree-expand').onclick = () => this.toggleAll(true);
            document.getElementById('tree-collapse').onclick = () => this.toggleAll(false);
        },

        activate: function(input) {
            this.input = input;
            this.render();
        },

        render: function() {
            const container = document.getElementById('tree-container');
            if (!container) return;
            
            const parsed = JSONUtils.parse(this.input);
            if (parsed === null) {
                container.innerHTML = '<div class="text-red-400">无效的 JSON</div>';
                return;
            }

            container.innerHTML = '';
            const tree = this.buildTree(parsed, 'root');
            container.appendChild(tree);
        },

        buildTree: function(data, key, isArrayItem = false) {
            const node = document.createElement('div');
            node.className = 'ml-4';

            const isObject = data !== null && typeof data === 'object';
            const isArray = Array.isArray(data);

            if (!isObject) {
                const valueSpan = document.createElement('span');
                valueSpan.className = isArrayItem ? '' : 'text-green-400';
                valueSpan.textContent = `${isArrayItem ? '' : key + ': '}${this.formatValue(data)}`;
                node.appendChild(valueSpan);
                return node;
            }

            const header = document.createElement('div');
            header.className = 'flex items-center gap-2 cursor-pointer hover:bg-gray-700 p-1 rounded';
            
            const caret = document.createElement('i');
            caret.className = 'fas fa-caret-down text-blue-400';
            header.appendChild(caret);

            const label = document.createElement('span');
            label.className = 'text-yellow-400';
            label.textContent = isArrayItem ? `[${key}]` : key;
            header.appendChild(label);

            const typeLabel = document.createElement('span');
            typeLabel.className = 'text-gray-500 text-xs';
            typeLabel.textContent = isArray ? `Array(${data.length})` : `Object{${Object.keys(data).length}}`;
            header.appendChild(typeLabel);

            node.appendChild(header);

            const children = document.createElement('div');
            children.className = 'border-l border-gray-600 ml-2';
            
            const entries = isArray ? data.map((v, i) => [i, v]) : Object.entries(data);
            for (const [k, v] of entries) {
                children.appendChild(this.buildTree(v, k, isArray));
            }

            node.appendChild(children);

            header.onclick = () => {
                const isExpanded = caret.classList.contains('fa-caret-down');
                caret.classList.toggle('fa-caret-down');
                caret.classList.toggle('fa-caret-right');
                children.classList.toggle('hidden');
            };

            return node;
        },

        formatValue: function(val) {
            if (val === null) return '<span class="text-red-400">null</span>';
            if (typeof val === 'boolean') return `<span class="text-purple-400">${val}</span>`;
            if (typeof val === 'number') return `<span class="text-blue-400">${val}</span>`;
            if (typeof val === 'string') return `<span class="text-green-400">"${val}"</span>`;
            return String(val);
        },

        toggleAll: function(expand) {
            const container = document.getElementById('tree-container');
            if (!container) return;
            
            const carets = container.querySelectorAll('.fa-caret-down, .fa-caret-right');
            const children = container.querySelectorAll('.border-l');
            
            carets.forEach(caret => {
                caret.classList.toggle('fa-caret-down', expand);
                caret.classList.toggle('fa-caret-right', !expand);
            });
            children.forEach(child => child.classList.toggle('hidden', !expand));
        }
    };

    if (window.AppInstance) {
        window.AppInstance.register('tree', TreeModule);
    }
})();
