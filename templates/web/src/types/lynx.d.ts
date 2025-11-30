declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lynx-view': {
        style?: React.CSSProperties;
        url?: string;
        'global-props'?: any;
        'init-data'?: any;
        'override-lynx-tag-to-html-tag-map'?: any;
        children?: React.ReactNode;
      };
    }
  }
}

export {};
