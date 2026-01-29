import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 166 166" xmlns="http://www.w3.org/2000/svg">
            {/* Wallet body */}
            <rect x="20" y="55" width="126" height="80" rx="6" fill="currentColor" opacity="0.2"/>
            
            {/* Wallet main */}
            <path d="M 20 61 Q 20 55 26 55 L 140 55 Q 146 55 146 61 L 146 73 L 20 73 Z" fill="currentColor" opacity="0.4"/>
            <rect x="20" y="73" width="126" height="62" rx="4" fill="currentColor"/>
            
            {/* Dollar signs coins */}
            <g>
                {/* Coin 1 */}
                <circle cx="50" cy="108" r="16" fill="#10B981"/>
                <text x="50" y="116" fontSize="22" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial">$</text>
                
                {/* Coin 2 */}
                <circle cx="95" cy="95" r="14" fill="#06B6D4"/>
                <text x="95" y="102" fontSize="18" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial">$</text>
                
                {/* Coin 3 */}
                <circle cx="125" cy="110" r="12" fill="#F59E0B"/>
                <text x="125" y="116" fontSize="14" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial">¢</text>
            </g>
        </svg>
    );
}
