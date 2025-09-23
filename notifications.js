// 🔔 Sistema de Notificações Elegante - PhotoViewer Lite v1.0
// Design moderno, não intrusivo e configurável

class NotificationSystem {
    constructor() {
        this.container = null;
        this.notifications = new Map();
        this.config = {
            duration: 4000,
            maxNotifications: 3,
            position: 'top-right',
            enableSound: false,
            enableAnimation: true
        };
        this.init();
    }

    // 🎨 Inicializar sistema de notificações
    init() {
        this.createContainer();
        this.injectStyles();
    }

    // 📦 Criar container das notificações
    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        this.container.className = 'notification-container';
        document.body.appendChild(this.container);
    }

    // 🎨 Estilos modernos com glassmorphism
    injectStyles() {
        const styles = `
            .notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                pointer-events: none;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }

            .notification {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                padding: 16px 20px;
                margin-bottom: 12px;
                min-width: 300px;
                max-width: 400px;
                box-shadow: 
                    0 8px 32px rgba(0, 0, 0, 0.1),
                    0 4px 16px rgba(0, 0, 0, 0.05);
                pointer-events: auto;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                transform: translateX(100%);
                opacity: 0;
                position: relative;
                overflow: hidden;
            }

            .notification.show {
                transform: translateX(0);
                opacity: 1;
            }

            .notification.hide {
                transform: translateX(100%);
                opacity: 0;
                margin-bottom: 0;
                padding-top: 0;
                padding-bottom: 0;
                min-height: 0;
            }

            .notification:hover {
                transform: translateX(-5px);
                box-shadow: 
                    0 12px 40px rgba(0, 0, 0, 0.15),
                    0 6px 20px rgba(0, 0, 0, 0.08);
            }

            .notification-header {
                display: flex;
                align-items: center;
                margin-bottom: 8px;
            }

            .notification-icon {
                width: 24px;
                height: 24px;
                margin-right: 12px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: bold;
                color: white;
                flex-shrink: 0;
            }

            .notification-title {
                font-weight: 600;
                font-size: 14px;
                color: #2d3748;
                margin: 0;
                flex: 1;
            }

            .notification-close {
                background: none;
                border: none;
                font-size: 18px;
                color: #a0aec0;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.2s ease;
            }

            .notification-close:hover {
                background: rgba(0, 0, 0, 0.1);
                color: #4a5568;
            }

            .notification-message {
                font-size: 13px;
                color: #4a5568;
                line-height: 1.4;
                margin: 0;
            }

            .notification-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
                border-radius: 0 0 12px 12px;
                transition: width linear;
            }

            /* 🎨 Tipos de notificação */
            .notification.success .notification-icon {
                background: linear-gradient(135deg, #48bb78, #38a169);
            }

            .notification.error .notification-icon {
                background: linear-gradient(135deg, #f56565, #e53e3e);
            }

            .notification.warning .notification-icon {
                background: linear-gradient(135deg, #ed8936, #dd6b20);
            }

            .notification.info .notification-icon {
                background: linear-gradient(135deg, #4299e1, #3182ce);
            }

            .notification.energy .notification-icon {
                background: linear-gradient(135deg, #ffd700, #ffb347);
            }

            /* 🌙 Modo escuro */
            @media (prefers-color-scheme: dark) {
                .notification {
                    background: rgba(45, 55, 72, 0.95);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .notification-title {
                    color: #e2e8f0;
                }

                .notification-message {
                    color: #a0aec0;
                }

                .notification-close {
                    color: #718096;
                }

                .notification-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #e2e8f0;
                }
            }

            /* 📱 Responsivo */
            @media (max-width: 480px) {
                .notification-container {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                }

                .notification {
                    min-width: auto;
                    max-width: none;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    // 🔔 Mostrar notificação
    show(options) {
        const {
            type = 'info',
            title = 'Notificação',
            message = '',
            duration = this.config.duration,
            persistent = false,
            icon = null
        } = options;

        // Limitar número de notificações
        if (this.notifications.size >= this.config.maxNotifications) {
            const firstNotification = this.notifications.keys().next().value;
            this.hide(firstNotification);
        }

        const id = this.generateId();
        const notification = this.createNotification(id, type, title, message, icon, persistent);
        
        this.notifications.set(id, {
            element: notification,
            timer: null,
            type,
            title,
            message
        });

        this.container.appendChild(notification);

        // Animação de entrada
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Auto-hide (se não for persistente)
        if (!persistent && duration > 0) {
            this.setAutoHide(id, duration);
        }

        return id;
    }

    // 🏗️ Criar elemento de notificação
    createNotification(id, type, title, message, customIcon, persistent) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.dataset.id = id;

        const iconMap = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ',
            energy: '⚡'
        };

        const icon = customIcon || iconMap[type] || 'ℹ';

        notification.innerHTML = `
            <div class="notification-header">
                <div class="notification-icon">${icon}</div>
                <h4 class="notification-title">${title}</h4>
                ${!persistent ? '<button class="notification-close" aria-label="Fechar">×</button>' : ''}
            </div>
            ${message ? `<p class="notification-message">${message}</p>` : ''}
            ${!persistent ? '<div class="notification-progress"></div>' : ''}
        `;

        // Event listeners
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.hide(id);
            });
        }

        notification.addEventListener('click', () => {
            this.hide(id);
        });

        return notification;
    }

    // ⏰ Configurar auto-hide
    setAutoHide(id, duration) {
        const notificationData = this.notifications.get(id);
        if (!notificationData) return;

        const progressBar = notificationData.element.querySelector('.notification-progress');
        if (progressBar) {
            progressBar.style.width = '100%';
            progressBar.style.transitionDuration = `${duration}ms`;
            
            requestAnimationFrame(() => {
                progressBar.style.width = '0%';
            });
        }

        notificationData.timer = setTimeout(() => {
            this.hide(id);
        }, duration);
    }

    // 🚫 Esconder notificação
    hide(id) {
        const notificationData = this.notifications.get(id);
        if (!notificationData) return;

        const { element, timer } = notificationData;

        if (timer) {
            clearTimeout(timer);
        }

        element.classList.add('hide');

        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            this.notifications.delete(id);
        }, 300);
    }

    // 🆔 Gerar ID único
    generateId() {
        return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // 🧹 Limpar todas as notificações
    clear() {
        this.notifications.forEach((_, id) => {
            this.hide(id);
        });
    }

    // ⚙️ Configurar sistema
    configure(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    // 🎯 Métodos de conveniência
    success(title, message, options = {}) {
        return this.show({ type: 'success', title, message, ...options });
    }

    error(title, message, options = {}) {
        return this.show({ type: 'error', title, message, ...options });
    }

    warning(title, message, options = {}) {
        return this.show({ type: 'warning', title, message, ...options });
    }

    info(title, message, options = {}) {
        return this.show({ type: 'info', title, message, ...options });
    }

    energy(title, message, options = {}) {
        return this.show({ type: 'energy', title, message, icon: '⚡', ...options });
    }
}

// 🌍 Instância global
window.notifications = new NotificationSystem();

// 🔄 Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationSystem;
}