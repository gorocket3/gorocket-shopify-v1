class CustomLoadingOverlay {
    eGui;

    init(params) {
        this.eGui = document.createElement('div');
        this.refresh(params);
    }

    getGui() {
        return this.eGui;
    }

    refresh(params) {
        const html = `
            <div class="ag-overlay-loading-center" role="presentation" style="border: unset; background: unset;">
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 17px;">
                    <div>
                        <span class="Polaris-Spinner Polaris-Spinner--sizeLarge">
                            <svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15.542 1.487A21.507 21.507 0 00.5 22c0 11.874 9.626 21.5 21.5 21.5 9.847 0 18.364-6.675 20.809-16.072a1.5 1.5 0 00-2.904-.756C37.803 34.755 30.473 40.5 22 40.5 11.783 40.5 3.5 32.217 3.5 22c0-8.137 5.3-15.247 12.942-17.65a1.5 1.5 0 10-.9-2.863z">
                                </path>
                            </svg>
                        </span>
                        <span role="status">
                            <span class="Polaris-Text--root Polaris-Text--visuallyHidden">Spinner</span>
                        </span>
                    </div>
                    <div aria-live="polite" aria-atomic="true">
                        <p style="font-size: 16px;">Loading...</p>
                    </div>
                </div>
            </div>
        `;
        this.eGui.innerHTML = html;
    }
}
