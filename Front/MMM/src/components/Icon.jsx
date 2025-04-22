// src/components/Icon.jsx
import React from 'react';
import { Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

const iconMap = {
    info: Info,
    'check-circle': CheckCircle,
    'alert-triangle': AlertTriangle,
    'alert-circle': AlertCircle,
};

export default function Icon({ name, stroke = '#000', size = 20, ...props }) {
    const Svg = iconMap[name];
    return Svg ? <Svg stroke={stroke} size={size} {...props} /> : null;
}
