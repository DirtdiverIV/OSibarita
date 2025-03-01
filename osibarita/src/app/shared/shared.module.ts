// src/app/shared/shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Importar componentes compartidos
import { RestaurantCardComponent } from './components/restaurant-card/restaurant-card.component';
import { GoldButtonComponent } from './components/gold-button/gold-button.component';
import { MenuItemCardComponent } from './components/menu-item-card/menu-item-card.component';
import { SplitPanelComponent } from './components/split-panel/split-panel.component';
import { MenuTitleComponent } from './components/menu-title/menu-title.component';
import { PriceTagComponent } from './components/price-tag/price-tag.component';
import { AdminNavbarComponent } from './components/admin-navbar/admin-navbar.component';
import { TabSelectorComponent } from './components/tab-selector/tab-selector.component';
import { GoldInputComponent } from './components/gold-input/gold-input.component';
import { ToggleSwitchComponent } from './components/toggle-switch/toggle-switch.component';
import { SceneContainerComponent } from './components/scene-container/scene-container.component';

@NgModule({
  declarations: [
    RestaurantCardComponent,
    GoldButtonComponent,
    MenuItemCardComponent,
    SplitPanelComponent,
    MenuTitleComponent,
    PriceTagComponent,
    AdminNavbarComponent,
    TabSelectorComponent,
    GoldInputComponent,
    ToggleSwitchComponent,
    SceneContainerComponent
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
    SplitPanelComponent,
    MenuTitleComponent,
    PriceTagComponent,
    AdminNavbarComponent,
    TabSelectorComponent,
    GoldInputComponent,
    ToggleSwitchComponent,
    SceneContainerComponent
  ]
})
export class SharedModule { }