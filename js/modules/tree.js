(function() {
    const TreeModule = {
        name: '树视图',
        icon: 'fa-sitemap',
        
        init: (container) => {
            container.innerHTML = `
                <div class="flex flex-col h-full gap-2">
                    <div class="flex justify-between items-center mb-2">
                        <div class="flex gap-2">
                            <button id="tree-expand" class="btn-secondary"><i class="fas fa-plus-square"></i> 全部展开</button>
                            <button id="tree-collapse" class="btn-secondary"><i class="fas fa-minus-square"></i> 全部收起</button>
                        </div>
                        <input type="text" id="tree-search" placeholder="搜索节点..." class="editor-box px-3 py-1 text-sm w-64"/>
                    </div>
                    <div id="tree-container" class="editor-box flex-1 overflow-auto font-mono text-sm"></div>
                </div>
            `;

            document.getElementById('tree-expand').onclick = () => toggleAll(true);
            document.getElementById('tree-collapse').onclick = () => toggleAll(false);
            
            let searchMatches = [];
            let currentMatch = -1;
            
            document.getElementById('tree-search').addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                if (!term) return;
                const container = document.getElementById('tree-container');
                const matches = container.querySelectorAll('[data-key*="' + term.toLowerCase() + '"], [data-value*="' + term.toLowerCase() + '"]');
                matches.forEach(el => el.classList.remove('highlight-search'));
                searchMatches = Array.from(matches);
                if (searchMatches.length > 0) {
                    currentMatch = 0;
                    highlightMatch(0);
                }
            });

            function highlightMatch(index) {
                if (index >= 0 && index < searchMatches.length) {
                    searchMatches[index].classList.add('highlight-search');
                    searchMatches[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }

            function toggleAll(expand) {
                const container = document.getElementById('tree-container');
                const carets = container.querySelectorAll('.caret');
                const children = container.querySelectorAll('.tree-children');
                carets.forEach(c => c.classList.toggle('caret-down', expand));
                children.forEach(c => c.classList.toggle('hidden-node', !expand));
            }
        },

        activate: (globalInput) => {
            const container = document.getElementById('tree-container');
            if (!container || !globalInput.trim()) return;
            
            const result = safeJsonParse(globalInput);
            if (result.error) {
                container.innerHTML = `<div class="text-red-400 p-4">${result.error}</div>`;
                return;
            }
            
            container.innerHTML = '';
            const tree = buildTree(result.data, container);
            container.appendChild(tree);
        },

        deactivate: () => {}
    };

    function buildTree(data, container, key = null, isLast = true) {
        const node = document.createElement('div');
        node.className = 'tree-node-item';
        
        if (key !== null) {
            const keySpan = document.createElement('span');
            keySpan.className = 'tree-key';
            keySpan.textContent = `"${key}": `;
            keySpan.dataset.key = key;
            node.appendChild(keySpan);
        }

        if (data === null) {
            const nullSpan = document.createElement('span');
            nullSpan.className = 'tree-null';
            nullSpan.textContent = 'null';
            nullSpan.dataset.value = 'null';
            node.appendChild(nullSpan);
        } else if (typeof data === 'boolean') {
            const boolSpan = document.createElement('span');
            boolSpan.className = 'tree-boolean';
            boolSpan.textContent = data.toString();
            boolSpan.dataset.value = data.toString();
            node.appendChild(boolSpan);
        } else if (typeof data === 'number') {
            const numSpan = document.createElement('span');
            numSpan.className = 'tree-number';
            numSpan.textContent = data.toString();
            numSpan.dataset.value = data.toString();
            node.appendChild(numSpan);
        } else if (typeof data === 'string') {
            const strSpan = document.createElement('span');
            strSpan.className = 'tree-string';
            strSpan.textContent = `"${data}"`;
            strSpan.dataset.value = data;
            node.appendChild(strSpan);
        } else if (Array.isArray(data) || typeof data === 'object') {
            const isArray = Array.isArray(data);
            const openBracket = document.createElement('span');
            openBracket.textContent = isArray ? '[' : '{';
            node.appendChild(openBracket);

            const children = document.createElement('div');
            children.className = 'tree-children';
            
            const entries = isArray ? data.map((v, i) => [i, v]) : Object.entries(data);
            entries.forEach(([k, v], idx) => {
                const childNode = buildTree(v, container, isArray ? null : k, idx === entries.length - 1);
                children.appendChild(childNode);
            });

            node.appendChild(children);

            const closeBracket = document.createElement('span');
            closeBracket.textContent = isArray ? ']' : '}';
            node.appendChild(closeBracket);

            const caret = document.createElement('span');
            caret.className = 'caret caret-down';
            caret.innerHTML = '<i class="fas fa-caret-right"></i>';
            caret.onclick = (e) => {
                e.stopPropagation();
                const isExpanded = caret.classList.contains('caret-down');
                caret.classList.toggle('caret-down', !isExpanded);
                children.classList.toggle('hidden-node', isExpanded);
            };
            node.insertBefore(caret, node.firstChild);
        }

        return node;
    }

    if (window.AppInstance) {
        window.AppInstance.register('tree', TreeModule);
    }
})();
