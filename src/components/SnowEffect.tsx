"use client";

import { useEffect, useState } from "react";

interface Snowflake {
    id: number;
    x: number;
    size: number;
    duration: number;
    delay: number;
    opacity: number;
    blur: number;
    layer: number;
    sway: number;
}

export default function SnowEffect() {
    const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

    useEffect(() => {
        const flakes: Snowflake[] = [];

        // Create multiple layers for 3D depth effect
        // Layer 1: Background (smaller, more blur, slower)
        // Layer 2: Midground (medium)
        // Layer 3: Foreground (larger, less blur, faster)

        for (let i = 0; i < 80; i++) {
            const layer = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3

            // Size based on layer (closer = bigger)
            const baseSize = layer === 1 ? 8 : layer === 2 ? 16 : 28;
            const sizeVariation = Math.random() * (baseSize * 0.5);

            // Blur based on layer (farther = more blur)
            const blur = layer === 1 ? 3 : layer === 2 ? 1.5 : 0;

            // Speed based on layer (closer = faster)
            const baseDuration = layer === 1 ? 25 : layer === 2 ? 18 : 12;

            // Opacity based on layer
            const opacity = layer === 1 ? 0.3 : layer === 2 ? 0.5 : 0.7;

            flakes.push({
                id: i,
                x: Math.random() * 100,
                size: baseSize + sizeVariation,
                duration: baseDuration + Math.random() * 8,
                delay: Math.random() * 15,
                opacity,
                blur,
                layer,
                sway: Math.random() * 40 - 20, // -20 to 20px sway
            });
        }
        setSnowflakes(flakes);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
            {/* Ambient glow layer */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent" />

            {snowflakes.map((flake) => (
                <div
                    key={flake.id}
                    className="absolute animate-fall-3d"
                    style={{
                        left: `${flake.x}%`,
                        fontSize: `${flake.size}px`,
                        animationDuration: `${flake.duration}s`,
                        animationDelay: `${flake.delay}s`,
                        opacity: flake.opacity,
                        filter: `blur(${flake.blur}px) drop-shadow(0 0 ${flake.size / 3}px rgba(255,255,255,0.5))`,
                        zIndex: flake.layer * 10,
                        // @ts-expect-error CSS custom property
                        "--sway": `${flake.sway}px`,
                    }}
                >
                    <span
                        className="inline-block"
                        style={{
                            color: `rgba(168, 216, 234, ${0.7 + flake.layer * 0.1})`,
                            textShadow: `0 0 ${flake.size / 2}px rgba(100, 180, 255, 0.9), 0 0 ${flake.size}px rgba(135, 206, 250, 0.6), 0 0 ${flake.size * 1.5}px rgba(70, 130, 220, 0.3)`,
                        }}
                    >
                        ❄
                    </span>
                </div>
            ))}

            {/* Extra large floating snowflakes for dramatic effect */}
            {[1, 2, 3, 4, 5].map((i) => (
                <div
                    key={`big-${i}`}
                    className="absolute animate-float"
                    style={{
                        color: "rgba(135, 180, 230, 0.25)",
                        left: `${15 + i * 18}%`,
                        top: `${10 + i * 12}%`,
                        fontSize: `${40 + i * 10}px`,
                        filter: `blur(${2 + i * 0.5}px)`,
                        animationDuration: `${8 + i * 2}s`,
                        animationDelay: `${i * 0.5}s`,
                    }}
                >
                    ❄
                </div>
            ))}
        </div>
    );
}
