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
            <div class="ag-overlay-loading-center" role="presentation" style="padding: 12px;border: 1px solid #c9c9c9; background: white;">
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    <div role="presentation" style="height:150px; width:180px;">
                        <div class="Polaris-LegacyCard">
                            <div class="Polaris-LegacyCard__Section Polaris-LegacyCard__FirstSectionPadding">
                                <div class="Polaris-TextContainer">
                                    <div class="Polaris-SkeletonDisplayText__DisplayText Polaris-SkeletonDisplayText--sizeSmall"></div>
                                    <div class="Polaris-SkeletonBodyText__SkeletonBodyTextContainer">
                                        <div class="Polaris-SkeletonBodyText"></div>
                                        <div class="Polaris-SkeletonBodyText"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="Polaris-LegacyCard__Section Polaris-LegacyCard__LastSectionPadding">
                                <div class="Polaris-SkeletonBodyText__SkeletonBodyTextContainer">
                                    <div class="Polaris-SkeletonBodyText"></div>
                                </div>
                            </div>
                        </div>
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
