import React from 'react';
import { motion } from 'framer-motion';

interface InferenceBadgeProps {
    type: 'speculative' | 'self-consistent' | 'skeleton' | 'verified' | 'needs-review';
    size?: 'sm' | 'md' | 'lg';
    animated?: boolean;
    showLabel?: boolean;
}

export const InferenceBadge: React.FC<InferenceBadgeProps> = ({
    type,
    size = 'md',
    animated = false,
    showLabel = true,
}) => {
    const badgeConfig = {
        speculative: {
            icon: '⚡',
            label: 'Speculative 2.1x',
            bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
            textColor: 'text-yellow-700 dark:text-yellow-400',
            borderColor: 'border-yellow-300 dark:border-yellow-700',
        },
        'self-consistent': {
            icon: '🎯',
            label: 'Self-Consistent',
            bgColor: 'bg-green-100 dark:bg-green-900/30',
            textColor: 'text-green-700 dark:text-green-400',
            borderColor: 'border-green-300 dark:border-green-700',
        },
        skeleton: {
            icon: '🧩',
            label: 'Skeleton-of-Thought',
            bgColor: 'bg-purple-100 dark:bg-purple-900/30',
            textColor: 'text-purple-700 dark:text-purple-400',
            borderColor: 'border-purple-300 dark:border-purple-700',
        },
        verified: {
            icon: '✅',
            label: 'Verified by CoV',
            bgColor: 'bg-blue-100 dark:bg-blue-900/30',
            textColor: 'text-blue-700 dark:text-blue-400',
            borderColor: 'border-blue-300 dark:border-blue-700',
        },
        'needs-review': {
            icon: '⚠️',
            label: 'Needs Review',
            bgColor: 'bg-orange-100 dark:bg-orange-900/30',
            textColor: 'text-orange-700 dark:text-orange-400',
            borderColor: 'border-orange-300 dark:border-orange-700',
        },
    };

    const config = badgeConfig[type];

    const sizeClasses = {
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-3 py-1.5',
        lg: 'text-base px-4 py-2',
    };

    const Component = (
        <div
            className={`inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-wide ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeClasses[size]}`}
        >
            <span>{config.icon}</span>
            {showLabel && <span>{config.label}</span>}
        </div>
    );

    if (!animated) {
        return Component;
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
        >
            {Component}
        </motion.div>
    );
};

interface InferenceIndicatorProps {
    status: string;
    isProcessing?: boolean;
}

export const InferenceIndicator: React.FC<InferenceIndicatorProps> = ({
    status,
    isProcessing = false,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400"
        >
            {isProcessing && (
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                />
            )}
            <span>{status}</span>
        </motion.div>
    );
};

interface SkeletonOutlineProps {
    skeleton: string;
    isExpanding?: boolean;
}

export const SkeletonOutline: React.FC<SkeletonOutlineProps> = ({
    skeleton,
    isExpanding = false,
}) => {
    const points = skeleton.split('\n').filter(p => p.trim());

    return (
        <motion.div className="space-y-2 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
            <h4 className="font-bold text-sm text-purple-900 dark:text-purple-300 mb-3">
                🧩 Reasoning Outline
            </h4>
            {points.map((point, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                        delay: idx * 0.15,
                        duration: 0.4,
                    }}
                    className="flex items-start gap-2"
                >
                    <span className="text-purple-500 font-bold mt-0.5">{idx + 1}.</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{point}</span>
                </motion.div>
            ))}
            {isExpanding && (
                <motion.div
                    animate={{ opacity: [0.4, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-2"
                >
                    Expanding reasoning...
                </motion.div>
            )}
        </motion.div>
    );
};
