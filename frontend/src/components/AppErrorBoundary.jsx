import { Component } from "react";

class AppErrorBoundary extends Component {
        constructor(props) {
                super(props);
                this.state = { hasError: false };
        }

        static getDerivedStateFromError() {
                return { hasError: true };
        }

        componentDidCatch(error, info) {
                console.error("[AppErrorBoundary] Uncaught error", error, info);
        }

        handleRetry = () => {
                if (typeof this.props.onReset === "function") {
                        try {
                                this.props.onReset();
                        } catch (error) {
                                console.error("[AppErrorBoundary] onReset handler threw", error);
                        }
                }
                this.setState({ hasError: false });
        };

        render() {
                if (this.state.hasError) {
                        return (
                                <div className='flex min-h-screen flex-col items-center justify-center bg-athath-ivory p-6 text-center text-athath-ink'>
                                        <h1 className='text-3xl font-semibold text-athath-gold'>حدث خطأ غير متوقع</h1>
                                        <p className='mt-4 max-w-md text-base text-athath-ink/80'>
                                                نأسف للإزعاج! يرجى تحديث الصفحة أو المحاولة مرة أخرى لاحقًا.
                                        </p>
                                        <button
                                                type='button'
                                                onClick={() => window.location.reload()}
                                                className='mt-6 rounded-lg border border-athath-gold px-4 py-2 text-athath-gold transition hover:bg-athath-gold/10'
                                        >
                                                إعادة المحاولة
                                        </button>
                                </div>
                        );
                }

                return this.props.children;
        }
}

export default AppErrorBoundary;
