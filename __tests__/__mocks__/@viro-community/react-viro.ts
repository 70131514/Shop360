// Mock for @viro-community/react-viro
export const ViroARSceneNavigator = jest.fn(({ initialScene, ...props }) => {
  const React = require('react');
  return React.createElement('View', { testID: 'ViroARSceneNavigator', ...props });
});

export const ViroARScene = jest.fn((props) => {
  const React = require('react');
  return React.createElement('View', { testID: 'ViroARScene', ...props });
});

export const Viro3DObject = jest.fn((props) => {
  const React = require('react');
  return React.createElement('View', { testID: 'Viro3DObject', ...props });
});

export const ViroNode = jest.fn((props) => {
  const React = require('react');
  return React.createElement('View', { testID: 'ViroNode', ...props });
});

export const ViroAmbientLight = jest.fn((props) => {
  const React = require('react');
  return React.createElement('View', { testID: 'ViroAmbientLight', ...props });
});

export const ViroQuad = jest.fn((props) => {
  const React = require('react');
  return React.createElement('View', { testID: 'ViroQuad', ...props });
});

export const ViroMaterials = {
  createMaterials: jest.fn(),
};
