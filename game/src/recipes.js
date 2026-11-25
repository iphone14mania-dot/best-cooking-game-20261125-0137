// HEARTHFIRE — ingredients, stations and dishes. All original names and art.
import { CHOP_CLICKS, BOIL_TIME, BAKE_TIME } from './config.js';

// Stations: chop needs clicks, grill is a timing needle, boil/bake are timers.
export const STATIONS = [
  { id: 'chop', name: 'Chopping Block', verb: 'CHOP', key: 'C', accepts: ['potato', 'carrot', 'mushroom', 'herb', 'cheese'], color: '#8a5a2e', blurb: 'Click 3x to chop' },
  { id: 'grill', name: 'Hearth Grill', verb: 'GRILL', key: 'G', accepts: ['chicken', 'mushroom'], color: '#b34724', blurb: 'Stop the needle in green' },
  { id: 'boil', name: 'Cauldron', verb: 'BOIL', key: 'B', accepts: ['potato', 'carrot', 'mushroom'], color: '#2e6f8e', blurb: 'Ready in 9s — don\'t burn it' },
  { id: 'bake', name: 'Stone Oven', verb: 'BAKE', key: 'O', accepts: ['bread', 'cheese'], color: '#7a5c2e', blurb: 'Ready in 11s — don\'t burn it' },
];

// Pantry ingredients. `cooked` maps station -> finished component id.
export const INGREDIENTS = [
  { id: 'chicken', name: 'Chicken', color: '#e8a87c', cooked: { grill: 'grilled-chicken' } },
  { id: 'potato', name: 'Potato', color: '#d9b380', cooked: { chop: 'chopped-potato', boil: 'boiled-potato' } },
  { id: 'carrot', name: 'Carrot', color: '#e67e22', cooked: { chop: 'chopped-carrot', boil: 'boiled-carrot' } },
  { id: 'mushroom', name: 'Mushroom', color: '#c9a0a0', cooked: { chop: 'chopped-mushroom', grill: 'grilled-mushroom', boil: 'boiled-mushroom' } },
  { id: 'bread', name: 'Bread', color: '#e0aa6e', cooked: { bake: 'baked-bread' } },
  { id: 'cheese', name: 'Cheese', color: '#f2d13d', cooked: { chop: 'grated-cheese', bake: 'baked-cheese' } },
  { id: 'herb', name: 'Herbs', color: '#58b368', cooked: { chop: 'chopped-herb' } },
  { id: 'ale', name: 'Ale', color: '#f2b134', cooked: {} }, // served as-is, see dishes
];

export const ING_BY_ID = Object.fromEntries(INGREDIENTS.map((i) => [i.id, i]));

// Finished components (what lands on the plate).
export const COMPONENTS = {
  'grilled-chicken': { name: 'Grilled Chicken', color: '#c96f2e', from: 'chicken' },
  'chopped-potato': { name: 'Chopped Potato', color: '#d9b380', from: 'potato' },
  'boiled-potato': { name: 'Boiled Potato', color: '#e8c98f', from: 'potato' },
  'chopped-carrot': { name: 'Chopped Carrot', color: '#e67e22', from: 'carrot' },
  'boiled-carrot': { name: 'Boiled Carrot', color: '#ef8f3a', from: 'carrot' },
  'chopped-mushroom': { name: 'Chopped Mushroom', color: '#c9a0a0', from: 'mushroom' },
  'grilled-mushroom': { name: 'Grilled Mushroom', color: '#a9715c', from: 'mushroom' },
  'boiled-mushroom': { name: 'Boiled Mushroom', color: '#b98a8a', from: 'mushroom' },
  'baked-bread': { name: 'Baked Bread', color: '#b97e3e', from: 'bread' },
  'grated-cheese': { name: 'Grated Cheese', color: '#f2d13d', from: 'cheese' },
  'baked-cheese': { name: 'Baked Cheese', color: '#e8b93a', from: 'cheese' },
  'chopped-herb': { name: 'Chopped Herbs', color: '#58b368', from: 'herb' },
  'ale': { name: 'Mug of Ale', color: '#f2b134', from: 'ale' },
};

// Dishes: each needs an exact set of components. `day` unlocks it.
export const DISHES = [
  { id: 'roast-chicken', name: 'Roast Chicken', price: 24, day: 0, needs: ['grilled-chicken', 'chopped-potato', 'chopped-carrot'], color: '#c96f2e', desc: 'Grill + chop + chop' },
  { id: 'hearty-stew', name: 'Hearty Stew', price: 22, day: 0, needs: ['boiled-potato', 'boiled-carrot', 'chopped-herb'], color: '#2e6f8e', desc: 'Boil + boil + chop' },
  { id: 'mushroom-melt', name: 'Mushroom Melt', price: 26, day: 0, needs: ['baked-bread', 'grilled-mushroom', 'grated-cheese'], color: '#f2d13d', desc: 'Bake + grill + chop' },
  { id: 'hunters-platter', name: "Hunter's Platter", price: 32, day: 1, needs: ['grilled-chicken', 'boiled-mushroom', 'baked-bread'], color: '#8a5a2e', desc: 'Grill + boil + bake' },
  { id: 'wizards-feast', name: "Wizard's Feast", price: 40, day: 2, needs: ['grilled-chicken', 'boiled-potato', 'grated-cheese', 'chopped-herb'], color: '#7b5ea7', desc: 'Grill + boil + chop + chop' },
  { id: 'ale-round', name: 'Ale Round', price: 12, day: 1, needs: ['ale'], color: '#f2b134', desc: 'Just pour it — click Ale, then the bell' },
];

export const DISH_BY_ID = Object.fromEntries(DISHES.map((d) => [d.id, d]));

export const CUSTOMERS = [
  { name: 'Sir Bram', kind: 'Knight', color: '#8fa3b8', hat: 'helm' },
  { name: 'Mira', kind: 'Wizard', color: '#7b5ea7', hat: 'pointy' },
  { name: 'Tomas', kind: 'Bard', color: '#c96f6f', hat: 'feather' },
  { name: 'Old Ned', kind: 'Farmer', color: '#a08050', hat: 'straw' },
  { name: 'Lira', kind: 'Elf', color: '#58b368', hat: 'hood' },
  { name: 'Gordo', kind: 'Blacksmith', color: '#5d5648', hat: 'band' },
];

export { CHOP_CLICKS, BOIL_TIME, BAKE_TIME };
