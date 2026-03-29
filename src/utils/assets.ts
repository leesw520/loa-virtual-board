const assetPathMap: Record<string, string> = {
  track_1: './images/main_tracks/track_1.png',
  track_2: './images/main_tracks/track_2.png',
  track_3: './images/main_tracks/track_3.png',
  token_vault_1: './images/token_vault_1.png',
  token_vault_2: './images/token_vault_2.png',
  basic_animals_ac: './images/basic_animals_ac.png',
  basic_animals_bd: './images/basic_animals_bd.png',
  special_animals: './images/special_animals.png',
  animals_back: './images/animals_back.png',
  environments: './images/environments.png',
  environments_back: './images/environments_back.jpg',
  bugs: './images/bugs.png',
  bugs_back: './images/bugs_back.jpg',
  point_sheet: './images/point_sheet.png',
  summary_actions: './images/summary_actions.png',
  summary_bonus: './images/summary_bonus.png',
}

export function imagePath(name: string) {
  return assetPathMap[name] ?? `./images/${name}.png`
}
