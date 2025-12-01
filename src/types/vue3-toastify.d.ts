declare module 'vue3-toastify/dist/index.mjs' {
  export function useToast(): {
    success: (msg: string, options?: any) => void
    error: (msg: string, options?: any) => void
    info: (msg: string, options?: any) => void
    warning: (msg: string, options?: any) => void
  }
}
