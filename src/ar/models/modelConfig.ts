import { ARModelKey } from '../scenes/ModelPlacementARScene';

export interface ARModelInfo {
  key: ARModelKey;
  name: string;
  icon?: string;
  description?: string;
}

export const AR_MODELS: ARModelInfo[] = [
  // Original Models
  {
    key: 'shoes',
    name: 'Shoes',
    icon: 'footsteps',
    description: 'Footwear model',
  },
  {
    key: 'hat',
    name: 'Hat',
    icon: 'baseball',
    description: 'Headwear model',
  },
  {
    key: 'sofa',
    name: 'Sofa',
    icon: 'home',
    description: 'Furniture model',
  },
  // Sofas
  {
    key: 'chesterfield_sofa',
    name: 'Chesterfield Sofa',
    icon: 'home',
    description: 'Classic sofa design',
  },
  {
    key: 'modern_sofa',
    name: 'Modern Sofa',
    icon: 'home',
    description: 'Contemporary sofa',
  },
  {
    key: 'sofa_chair',
    name: 'Sofa Chair',
    icon: 'home',
    description: 'Single seat sofa',
  },
  {
    key: 'sofa_pink',
    name: 'Pink Sofa',
    icon: 'home',
    description: 'Pink colored sofa',
  },
  {
    key: 'sofa_single',
    name: 'Single Sofa',
    icon: 'home',
    description: 'Single seat sofa',
  },
  {
    key: 'sofa1',
    name: 'Sofa Variant',
    icon: 'home',
    description: 'Alternative sofa design',
  },
  {
    key: 'wooden_sofa',
    name: 'Wooden Sofa',
    icon: 'home',
    description: 'Wooden frame sofa',
  },
  // Chairs
  {
    key: 'arm_chair_furniture',
    name: 'Arm Chair',
    icon: 'chair',
    description: 'Comfortable armchair',
  },
  {
    key: 'armchair',
    name: 'Armchair',
    icon: 'chair',
    description: 'Classic armchair',
  },
  {
    key: 'chair',
    name: 'Chair',
    icon: 'chair',
    description: 'Standard chair',
  },
  {
    key: 'chair1',
    name: 'Chair Variant 1',
    icon: 'chair',
    description: 'Alternative chair design',
  },
  {
    key: 'chair2',
    name: 'Chair Variant 2',
    icon: 'chair',
    description: 'Alternative chair design',
  },
  {
    key: 'cover_chair',
    name: 'Cover Chair',
    icon: 'chair',
    description: 'Upholstered chair',
  },
  {
    key: 'mid_century_lounge_chair',
    name: 'Mid Century Lounge Chair',
    icon: 'chair',
    description: 'Vintage style lounge chair',
  },
  {
    key: 'office_chair_gaming_chair',
    name: 'Gaming Chair',
    icon: 'chair',
    description: 'Ergonomic gaming chair',
  },
  {
    key: 'rustic_chair',
    name: 'Rustic Chair',
    icon: 'chair',
    description: 'Rustic style chair',
  },
  // Tables
  {
    key: 'a_table',
    name: 'Table A',
    icon: 'grid',
    description: 'Modern table design',
  },
  {
    key: 'console_table',
    name: 'Console Table',
    icon: 'grid',
    description: 'Narrow console table',
  },
  {
    key: 'industrial_table',
    name: 'Industrial Table',
    icon: 'grid',
    description: 'Industrial style table',
  },
  {
    key: 'lowpoly_old_table',
    name: 'Low Poly Table',
    icon: 'grid',
    description: 'Vintage style table',
  },
  {
    key: 'mahogany_table',
    name: 'Mahogany Table',
    icon: 'grid',
    description: 'Wooden mahogany table',
  },
  {
    key: 'table',
    name: 'Table',
    icon: 'grid',
    description: 'Standard table',
  },
  {
    key: 'table1',
    name: 'Table Variant',
    icon: 'grid',
    description: 'Alternative table design',
  },
  {
    key: 'table_furniture',
    name: 'Furniture Table',
    icon: 'grid',
    description: 'Decorative table',
  },
  // Beds
  {
    key: 'bed',
    name: 'Bed',
    icon: 'bed',
    description: 'Standard bed',
  },
  {
    key: 'bed1',
    name: 'Bed Variant 1',
    icon: 'bed',
    description: 'Alternative bed design',
  },
  {
    key: 'bed2',
    name: 'Bed Variant 2',
    icon: 'bed',
    description: 'Alternative bed design',
  },
  // Bathroom
  {
    key: 'bath_with_sink',
    name: 'Bath with Sink',
    icon: 'water',
    description: 'Bathroom fixture',
  },
  {
    key: 'bathroom_sink_cabinet',
    name: 'Sink Cabinet',
    icon: 'water',
    description: 'Bathroom sink with cabinet',
  },
  {
    key: 'kitchen_sink',
    name: 'Kitchen Sink',
    icon: 'water',
    description: 'Kitchen sink',
  },
  {
    key: 'sink',
    name: 'Sink',
    icon: 'water',
    description: 'Standard sink',
  },
  {
    key: 'sink1',
    name: 'Sink Variant',
    icon: 'water',
    description: 'Alternative sink design',
  },
  // Lighting
  {
    key: 'desk_lamp',
    name: 'Desk Lamp',
    icon: 'bulb',
    description: 'Desktop lamp',
  },
  {
    key: 'table_lamp',
    name: 'Table Lamp',
    icon: 'bulb',
    description: 'Tabletop lamp',
  },
  {
    key: 'table_lamp_01',
    name: 'Table Lamp 01',
    icon: 'bulb',
    description: 'Alternative lamp design',
  },
  // Electronics - Cameras
  {
    key: 'camera_canon_eos_400d',
    name: 'Canon EOS 400D',
    icon: 'camera',
    description: 'Digital camera',
  },
  {
    key: 'canon_at_1_retro_camera',
    name: 'Canon AT-1',
    icon: 'camera',
    description: 'Retro film camera',
  },
  {
    key: 'dae_bilora_bella_46_camera_game_ready_asset',
    name: 'Bilora Bella 46',
    icon: 'camera',
    description: 'Vintage camera',
  },
  // Electronics - Laptops
  {
    key: 'laptop',
    name: 'Laptop',
    icon: 'laptop',
    description: 'Standard laptop',
  },
  {
    key: 'laptop1',
    name: 'Laptop Variant 1',
    icon: 'laptop',
    description: 'Alternative laptop design',
  },
  {
    key: 'laptop2',
    name: 'Laptop Variant 2',
    icon: 'laptop',
    description: 'Alternative laptop design',
  },
  {
    key: 'laptop3',
    name: 'Laptop Variant 3',
    icon: 'laptop',
    description: 'Alternative laptop design',
  },
  {
    key: 'laptop4',
    name: 'Laptop Variant 4',
    icon: 'laptop',
    description: 'Alternative laptop design',
  },
  // Electronics - Gaming Consoles
  {
    key: 'gameboy',
    name: 'Game Boy',
    icon: 'game-controller',
    description: 'Classic handheld console',
  },
  {
    key: 'ps5',
    name: 'PlayStation 5',
    icon: 'game-controller',
    description: 'Gaming console',
  },
  {
    key: 'steam_deck_console',
    name: 'Steam Deck',
    icon: 'game-controller',
    description: 'Handheld gaming console',
  },
  {
    key: 'wii_console',
    name: 'Wii Console',
    icon: 'game-controller',
    description: 'Nintendo gaming console',
  },
  {
    key: 'xbox_series_x_console',
    name: 'Xbox Series X',
    icon: 'game-controller',
    description: 'Gaming console',
  },
  {
    key: 'xbox_controller',
    name: 'Xbox Controller',
    icon: 'game-controller',
    description: 'Gaming controller',
  },
  // Other Furniture
  {
    key: 'soviet_furniture',
    name: 'Soviet Furniture',
    icon: 'home',
    description: 'Vintage furniture piece',
  },
];

export function getModelInfo(key: ARModelKey): ARModelInfo | undefined {
  return AR_MODELS.find((model) => model.key === key);
}
