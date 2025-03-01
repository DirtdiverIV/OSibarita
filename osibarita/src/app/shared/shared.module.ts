// src/app/shared/shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { RestaurantCardComponent } from './components/restaurant-card/restaurant-card.component';
import { GoldButtonComponent } from './components/gold-button/gold-button.component';
import { MenuItemCardComponent } from './components/menu-item-card/menu-item-card.component';

// Importaremos los componentes adicionales a medida que los creemos
// Por ahora, comentemos las importaciones para que compile

@NgModule({
  declarations: [
    RestaurantCardComponent,
    GoldButtonComponent,
    MenuItemCardComponent,
    // SplitPanelComponent,
    // MenuTitleComponent,
    // PriceTagComponent,
    // AdminNavbarComponent,
    // TabSelectorComponent,
    // GoldInputComponent,
    // ToggleSwitchComponent,
    // SceneContainerComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  exports: [
    RestaurantCardComponent,
    GoldButtonComponent,
    MenuItemCardComponent,
    // SplitPanelComponent,
    // MenuTitleComponent,
    // PriceTagComponent,
    // AdminNavbarComponent,
    // TabSelectorComponent,
    // GoldInputComponent,
    // ToggleSwitchComponent,
    // SceneContainerComponent
  ]
})
export class SharedModule { }