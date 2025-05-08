import { useState } from "react";
import { Icon, Image, Thumbnail } from "@shopify/polaris";
import { AlertDiamondIcon, ImageIcon } from "@shopify/polaris-icons";

export function FeaturedImage({ src, alt, size = "large" }) {
    const [ error, setError ] = useState(false);

    return !src ? (
        <Thumbnail source={ImageIcon} alt={alt} size={size}/>
    ) : error ? (
        <div className="flex justify-center items-center overflow-hidden border rounded-lg"
             style={{ width: "80px", height: "80px", borderColor: "var(--p-color-border-critical)" }}>
            <Icon source={AlertDiamondIcon} tone="critical"/>
        </div>
    ) : (
        <div className="flex justify-center items-center overflow-hidden border rounded-lg">
            <Image defer source={src} width={80} alt={alt} onError={(e) => setError(true)}/>
        </div>
    )
}
