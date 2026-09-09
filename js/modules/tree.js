// Tree View Module - 交互式树视图
const TreeModule = {
    container: null,
    output: null,
    errorBox: null,
    errorText: null,
    searchInput: null,
    searchCount: null,
    searchMatches: [],
    currentMatchIndex: -1,

    init() {
        this.container = document.getElementById('treeContainer');
        this.output = document.getElementById('treeOutput');
        this.errorBox = document.getElementById('errorMsg');
        this.errorText = document.getElementById('errorText');
        this.searchInput = document.getElementById('treeSearchInput');
        this.searchCount = document.getElementById('treeSearchCount');
        console.log('[TreeModule] Initialized');
    },

    onActivate() {
        const input = document.getElementById('treeInput');
        if (input && input.value.trim()) {
            this.renderTree(input.value);
        }
    },

    onSync(data) {
        const input = document.getElementById('treeInput');
        if (input && document.getElementById('viewTree').classList.contains('hidden') === false) {
            this.renderTree(data);
        }
    },

    renderTree(jsonStr) {
        if (!jsonStr || !jsonStr.trim()) {
            this.output.innerHTML = '<span class="text-slate-500 italic">等待输入 JSON...</span>';
            return;
        }

        try {
            const data = JSON.parse(jsonStr);
            this.hideError();
            const html = this.buildTree(data);
            this.output.innerHTML = html;
            this.searchMatches = [];
            this.currentMatchIndex = -1;
            this.updateSearchCount();
        } catch (e) {
            this.showError(e.message);
        }
    },

    buildTree(data) {
        return '<ul>' + this.buildNode('', data) + '</ul>';
    },

    buildNode(key, value) {
        const type = this.getType(value);
        const isObject = type === 'object';
        const isArray = type === 'array';
        const hasChildren = isObject || isArray;
        const isEmpty = hasChildren && (type === 'object' ? Object.keys(value).length === 0 : value.length === 0);

        let liClass = 'j-node';
        if (hasChildren && !isEmpty) liClass += ' collapsed';

        let rowContent = '';
        
        // Key
        if (key !== '') {
            rowContent += `<span class="json-key">"${this.escapeHtml(key)}"</span>: `;
        }

        if (hasChildren && !isEmpty) {
            const toggleIcon = isArray ? '<i class="fa-solid fa-caret-down"></i>' : '<i class="fa-solid fa-caret-right"></i>';
            rowContent += `<span class="j-toggle" onclick="TreeModule.toggleNode(this)">${toggleIcon}</span>`;
            
            if (isArray) {
                rowContent += `<span class="text-purple-400">[</span><span class="j-ell" onclick="TreeModule.expandNode(this)">...</span>`;
            } else {
                rowContent += `<span class="text-yellow-400">{</span><span class="j-ell" onclick="TreeModule.expandNode(this)">...</span>`;
            }
            
            let closeBracket = isArray ? ']' : '}';
            let closeColor = isArray ? 'text-purple-400' : 'text-yellow-400';

            let childrenHtml = '<ul class="j-children">';
            if (isObject) {
                for (const [k, v] of Object.entries(value)) {
                    childrenHtml += this.buildNode(k, v);
                }
            } else {
                for (let i = 0; i < value.length; i++) {
                    childrenHtml += this.buildNode(String(i), value[i]);
                }
            }
            childrenHtml += '</ul>';

            rowContent += childrenHtml;
            rowContent += `<div class="j-close"><span class="${closeColor}">${closeBracket}</span></div>`;
        } else {
            rowContent += `<span class="j-sp"></span>`;
            rowContent += this.formatValue(value);
        }

        return `<li class="${liClass}"><div class="j-row">${rowContent}</div></li>`;
    },

    formatValue(value) {
        const type = typeof value;
        if (value === null) return '<span class="json-null">null</span>';
        if (type === 'boolean') return `<span class="json-boolean">${value}</span>`;
        if (type === 'number') return `<span class="json-number">${value}</span>`;
        if (type === 'string') return `<span class="json-string">"${this.escapeHtml(value)}"</span>`;
        return `<span class="text-slate-400">${String(value)}</span>`;
    },

    getType(value) {
        if (value === null) return 'null';
        if (Array.isArray(value)) return 'array';
        return typeof value;
    },

    escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    toggleNode(toggleEl) {
        const li = toggleEl.closest('li.j-node');
        const isCollapsed = li.classList.contains('collapsed');
        
        if (isCollapsed) {
            li.classList.remove('collapsed');
            toggleEl.innerHTML = '<i class="fa-solid fa-caret-down"></i>';
        } else {
            li.classList.add('collapsed');
            toggleEl.innerHTML = '<i class="fa-solid fa-caret-right"></i>';
        }
    },

    expandNode(ellEl) {
        const li = ellEl.closest('li.j-node');
        li.classList.remove('collapsed');
        const toggle = li.querySelector('.j-toggle');
        if (toggle) {
            toggle.innerHTML = '<i class="fa-solid fa-caret-down"></i>';
        }
    },

    doToggleAll(expand) {
        const nodes = this.output.querySelectorAll('li.j-node');
        nodes.forEach(li => {
            if (expand) {
                li.classList.remove('collapsed');
                const toggle = li.querySelector('.j-toggle');
                if (toggle) toggle.innerHTML = '<i class="fa-solid fa-caret-down"></i>';
            } else {
                li.classList.add('collapsed');
                const toggle = li.querySelector('.j-toggle');
                if (toggle) toggle.innerHTML = '<i class="fa-solid fa-caret-right"></i>';
            }
        });
    },

    showError(msg) {
        this.errorText.textContent = 'JSON 解析错误：' + msg;
        this.errorBox.classList.remove('hidden');
        this.output.innerHTML = '';
    },

    hideError() {
        this.errorBox.classList.add('hidden');
    },

    handleTreeSearch(event) {
        if (event.key === 'Enter') {
            this.navigateTreeSearch(1);
        } else if (event.key === 'Escape') {
            this.clearSearch();
        } else {
            setTimeout(() => this.performSearch(), 100);
        }
    },

    performSearch() {
        const query = this.searchInput.value.toLowerCase().trim();
        const rows = this.output.querySelectorAll('.j-row');
        
        // Clear previous highlights
        rows.forEach(row => {
            row.querySelectorAll('mark').forEach(mark => {
                const parent = mark.parentNode;
                parent.replaceChild(document.createTextNode(mark.textContent), mark);
                parent.normalize();
            });
        });

        this.searchMatches = [];
        if (!query) {
            this.updateSearchCount();
            return;
        }

        rows.forEach((row, idx) => {
            const text = row.textContent.toLowerCase();
            if (text.includes(query)) {
                this.searchMatches.push(row);
                this.highlightText(row, query);
            }
        });

        this.currentMatchIndex = this.searchMatches.length > 0 ? 0 : -1;
        this.updateSearchCount();
        this.scrollToCurrentMatch();
    },

    highlightText(element, query) {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);

        nodes.forEach(node => {
            const text = node.textContent;
            const lowerText = text.toLowerCase();
            const idx = lowerText.indexOf(query);
            if (idx !== -1) {
                const before = text.substring(0, idx);
                const match = text.substring(idx, idx + query.length);
                const after = text.substring(idx + query.length);

                const fragment = document.createDocumentFragment();
                if (before) fragment.appendChild(document.createTextNode(before));
                
                const mark = document.createElement('mark');
                mark.textContent = match;
                fragment.appendChild(mark);
                
                if (after) fragment.appendChild(document.createTextNode(after));
                
                node.parentNode.replaceChild(fragment, node);
            }
        });
    },

    navigateTreeSearch(direction) {
        if (this.searchMatches.length === 0) return;
        
        this.currentMatchIndex += direction;
        if (this.currentMatchIndex < 0) this.currentMatchIndex = this.searchMatches.length - 1;
        if (this.currentMatchIndex >= this.searchMatches.length) this.currentMatchIndex = 0;
        
        this.scrollToCurrentMatch();
    },

    scrollToCurrentMatch() {
        if (this.currentMatchIndex < 0 || this.currentMatchIndex >= this.searchMatches.length) return;
        
        const current = this.searchMatches[this.currentMatchIndex];
        current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Highlight current
        this.searchMatches.forEach((row, idx) => {
            const mark = row.querySelector('mark');
            if (mark) {
                if (idx === this.currentMatchIndex) {
                    mark.classList.add('current');
                } else {
                    mark.classList.remove('current');
                }
            }
        });
        
        this.updateSearchCount();
    },

    updateSearchCount() {
        if (this.searchMatches.length === 0) {
            this.searchCount.classList.add('hidden');
        } else {
            this.searchCount.textContent = `${this.currentMatchIndex + 1}/${this.searchMatches.length}`;
            this.searchCount.classList.remove('hidden');
        }
    },

    clearSearch() {
        this.searchInput.value = '';
        this.performSearch();
    }
};

App.registerModule('tree', TreeModule);
window.doToggleAll = (expand) => TreeModule.doToggleAll(expand);
window.handleTreeSearch = (e) => TreeModule.handleTreeSearch(e);
window.navigateTreeSearch = (dir) => TreeModule.navigateTreeSearch(dir);
