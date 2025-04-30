import React, { Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Page } from "@shopify/polaris";

export default function HomePage() {
    const navigate = useNavigate();
    const HomeMain = React.lazy(() => import('../components/index/main'));

    return (
        <Page
            title="Gorocket Editor"
            secondaryActions={[
                { content: 'Products', onAction: () => navigate('/products') },
                { content: 'History', onAction: () => navigate('/history') },
                { content: 'Plan', onAction: () => navigate('/plan') }
            ]}
        >
            <Suspense fallback={false}>
                <HomeMain/>
            </Suspense>
        </Page>
    );
}
