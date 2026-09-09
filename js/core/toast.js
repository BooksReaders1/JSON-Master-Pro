/**
 * Toast 通知系统
 * 替代 alert，自动消失不打断用户操作
 */

const Toast = {
    container: null,
    
    init() {
        if (this.container) return;
        this.container = document.createElement('div');
        this.container.id = 'toastContainer';
        this.container.className = 'fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none';
        document.body.appendChild(this.container);
    },
    
    show(message, type = 'info', duration = 3000) {
        if (!this.container) this.init();
        
        const types = {
            info: { bg: 'bg-blue-600', icon: 'fa-info-circle' },
            success: { bg: 'bg-green-600', icon: 'fa-check-circle' },
            warning: { bg: 'bg-amber-600', icon: 'fa-triangle-exclamation' },
            error: { bg: 'bg-red-600', icon: 'fa-circle-exclamation' }
        };
        
        const config = types[type] || types.info;
        
        const toast = document.createElement('div');
        toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white ${config.bg} transform transition-all duration-300 translate-x-full opacity-0 min-w-[280px] max-w-md`;
        toast.innerHTML = `
            <i class="fa-solid ${config.icon}"></i>
            <span class="text-sm font-medium flex-1">${message}</span>
            <button onclick="this.parentElement.remove()" class="ml-2 hover:bg-white/20 rounded p-1">
                <i class="fa-solid fa-times text-xs"></i>
            </button>
        `;
        
        this.container.appendChild(toast);
        
        // Animate in
        requestAnimationFrame(() => {
            toast.classList.remove('translate-x-full', 'opacity-0');
        });
        
        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                toast.classList.add('translate-x-full', 'opacity-0');
                setTimeout(() => toast.remove(), 300);
            }, duration);
        }
        
        return toast;
    },
    
    info(msg, dur) { return this.show(msg, 'info', dur); },
    success(msg, dur) { return this.show(msg, 'success', dur); },
    warning(msg, dur) { return this.show(msg, 'warning', dur); },
    error(msg, dur) { return this.show(msg, 'error', dur); }
};

// Global shortcut
function showToast(message, type = 'info', duration = 3000) {
    Toast.show(message, type, duration);
}
