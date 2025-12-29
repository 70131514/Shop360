declare module '@viro-community/react-viro' {
  import * as React from 'react';

  export class ViroTelemetry {
    static setDebugging(): void;
    static optOutTelemetry(): void;
    static recordTelemetry(eventName: string, payload?: any): void;
  }

  export class ViroMaterials {
    static createMaterials(materials: any): void;
  }

  export class ViroNode extends React.Component<any> {}
  export class ViroQuad extends React.Component<any> {}
  export class ViroSphere extends React.Component<any> {}

  export class ViroARSceneNavigator extends React.Component<any> {}
  export class ViroARScene extends React.Component<any> {}
  export class ViroARPlaneSelector extends React.Component<any> {}
  export class ViroText extends React.Component<any> {}
  export class ViroAmbientLight extends React.Component<any> {}
  export class Viro3DObject extends React.Component<any> {}
}
