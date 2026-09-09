/**
 * 格式化模块 - JSON 格式化/压缩
 */

const FormatModule = {
    elements: {},
    searchMatches: [],
    currentMatchIndex: -1,
    
    init(els) {
        this.elements = {
            output: document.getElementById('fmtOutput'),
            error: document.getElementById('fmtError'),
            errorText: document.getElementById('fmtErrorText'),
            searchInput: document.getElementById('fmtSearchInput'),
            searchCount: document.getElementById('fmtSearchCount')
        };
        
        // Setup input listener with debounce for performance
        const inputEl = document.getElementById('inputJson');
        if (inputEl) {
            inputEl.addEventListener('input', Utils.debounce(() => {
                this.doFormat();
            }, 300));
        }
        
        console.log('[FormatModule] Initialized');
    },
    
    doFormat() {
        const src = document.getElementById('inputJson').value.trim();
        if (!src) {
            this.elements.output.innerHTML = '';
            this.elements.error.classList.add('hidden');
            return;
        }
        
        try {
            const data = JSON.parse(src);
            const formatted = JSON.stringify(data, null, 4);
            this.elements.output.innerHTML = this.syntaxHighlight(formatted);
            this.elements.error.classList.add('hidden');
        } catch (e) {
            this.elements.errorText.textContent = 'JSON 格式错误：' + e.message;
            this.elements.error.classList.remove('hidden');
        }
    },
    
    minify() {
        const src = document.getElementById('inputJson').value.trim();
        if (!src) {
            showToast('没有可压缩的内容', 'warning');
            return;
        }
        
        try {
            const data = JSON.parse(src);
            const minified = JSON.stringify(data);
            this.elements.output.innerHTML = this.syntaxHighlight(minified);
            this.elements.error.classList.add('hidden');
            showToast('压缩完成', 'success');
        } catch (e) {
            showToast('JSON 格式错误：' + e.message, 'error');
        }
    },
    
    syntaxHighlight(json) {
        if (!json) return '';
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            let cls = 'json-number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'json-key';
                } else {
                    cls = 'json-string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'json-boolean';
            } else if (/null/.test(match)) {
                cls = 'json-null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    },
    
    handleSearch(event) {
        if (event.key === 'Enter') {
            this.navigateSearch(1);
        } else {
            this.performSearch();
        }
    },
    
    performSearch() {
        const query = this.elements.searchInput.value.trim();
        const content = this.elements.output.textContent;
        
        // Clear previous marks
        this.elements.output.innerHTML = this.syntaxHighlight(this.elements.output.textContent);
        
        if (!query || !content) {
            this.elements.searchCount.classList.add('hidden');
            this.searchMatches = [];
            this.currentMatchIndex = -1;
            return;
        }
        
        // Simple search implementation
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedQuery, 'gi');
        const matches = [...content.matchAll(regex)];
        
        this.searchMatches = matches;
        this.currentMatchIndex = matches.length > 0 ? 0 : -1;
        
        if (matches.length > 0) {
            this.elements.searchCount.textContent = `${this.currentMatchIndex + 1}/${matches.length}`;
            this.elements.searchCount.classList.remove('hidden');
            this.highlightCurrentMatch();
        } else {
            this.elements.searchCount.classList.add('hidden');
        }
    },
    
    navigateSearch(direction) {
        if (this.searchMatches.length === 0) return;
        
        this.currentMatchIndex += direction;
        if (this.currentMatchIndex < 0) this.currentMatchIndex = this.searchMatches.length - 1;
        if (this.currentMatchIndex >= this.searchMatches.length) this.currentMatchIndex = 0;
        
        this.elements.searchCount.textContent = `${this.currentMatchIndex + 1}/${this.searchMatches.length}`;
        this.highlightCurrentMatch();
    },
    
    highlightCurrentMatch() {
        // Clear previous highlights
        document.querySelectorAll('mark.current').forEach(el => {
            el.classList.remove('current');
        });
        
        if (this.searchMatches[this.currentMatchIndex]) {
            // Implementation for highlighting would require more complex DOM manipulation
            // For now, just update the counter
        }
    },
    
    getContentForCopy() {
        return this.elements.output.textContent;
    },
    
    onActivate() {
        this.doFormat();
    },
    
    onSync(value) {
        this.doFormat();
    }
};

// Register module
App.registerModule('format', FormatModule);

// Global functions for HTML onclick handlers
window.doFormat = () => FormatModule.doFormat();
window.minifyJson = () => FormatModule.minify();
window.handleFmtSearch = (e) => FormatModule.handleSearch(e);
window.navigateFmtSearch = (dir) => FormatModule.navigateSearch(dir);
