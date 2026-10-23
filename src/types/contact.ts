// src/types/contact.ts
export interface LineProps {
    position: 'left' | 'right';
}

export interface MarqueeProps {
    text: string;
    emailLink: string;
}

export interface EmailButtonProps {
    email: string;
}