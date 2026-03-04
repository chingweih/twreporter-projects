<svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 362 368"
    preserveAspectRatio="none"
    fill="none"
    style="width: 100%; height: 100%; position: absolute; top: 0; left: 0;"
    class="mobile"
>
    <g filter="url(#filter0_i_820_4154)">
        <path
            d="M312.884 32.8071C316.025 33.3797 318.704 35.4176 320.093 38.2919L360.712 122.299C361.478 123.884 361.813 125.643 361.681 127.398L347.335 319.16C347.057 322.882 344.728 326.14 341.297 327.608L248.884 367.148C247.246 367.849 245.45 368.099 243.682 367.873L30.7515 340.66C26.3761 340.101 22.8839 336.741 22.1562 332.39L0.13688 200.743C-0.0321463 199.733 -0.0448596 198.702 0.0991824 197.688L22.4958 39.9583C23.0372 36.1454 25.7201 32.9821 29.3936 31.8257L129.021 0.461579C130.571 -0.0265991 132.218 -0.129353 133.817 0.162218L312.884 32.8071Z"
            fill="var(--background-primary)"
        />
    </g>
    <defs>
        <filter
            id="filter0_i_820_4154"
            x="-3.19298"
            y="-3.19298"
            width="364.902"
            height="371.147"
            filterUnits="userSpaceOnUse"
            color-interpolation-filters="sRGB"
        >
            <feFlood flood-opacity="0" result="BackgroundImageFix" />
            <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
            />
            <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
            />
            <feOffset dx="-3.19298" dy="-3.19298" />
            <feGaussianBlur stdDeviation="5.98684" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
            />
            <feBlend
                mode="normal"
                in2="shape"
                result="effect1_innerShadow_820_4154"
            />
        </filter>
    </defs>
</svg>

<svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 826 477"
    preserveAspectRatio="none"
    fill="none"
    style="width: 100%; height: 100%; position: absolute; top: 0; left: 0;"
    class="desktop"
>
    <g filter="url(#filter0_i_820_4113)">
        <path
            d="M741.029 37.2554C746.199 37.631 750.808 40.649 753.22 45.2372L824.107 180.108C825.561 182.873 826.114 186.023 825.691 189.118L799.25 382.556C798.403 388.753 793.8 393.774 787.699 395.155L568.101 444.848C566.604 445.187 565.063 445.294 563.534 445.165L86.1197 405.055C80.9696 404.622 76.405 401.569 74.0393 396.974L1.66393 256.399C0.469837 254.079 -0.0987573 251.489 0.014266 248.882L7.86209 67.9208C8.14726 61.3452 12.6858 55.7236 19.0535 54.0586L223.938 0.487835C225.53 0.0716943 227.179 -0.0798009 228.82 0.0394111L741.029 37.2554Z"
            fill="var(--background-primary)"
        />
    </g>
    <defs>
        <filter
            id="filter0_i_820_4113"
            x="-8"
            y="-10"
            width="833.829"
            height="455.218"
            filterUnits="userSpaceOnUse"
            color-interpolation-filters="sRGB"
        >
            <feFlood flood-opacity="0" result="BackgroundImageFix" />
            <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
            />
            <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
            />
            <feOffset dx="-8" dy="-10" />
            <feGaussianBlur stdDeviation="5" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
            />
            <feBlend
                mode="normal"
                in2="shape"
                result="effect1_innerShadow_820_4113"
            />
        </filter>
    </defs>
</svg>

<style>
    svg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        transform: scale(1.15);
    }

    .mobile {
        display: none;
    }

    .desktop {
        display: block;
    }

    @media (max-width: 550px) {
        .mobile {
            display: block;
        }

        .desktop {
            display: none;
        }
    }
</style>
