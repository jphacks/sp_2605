/*******************************************************************************
 * File Name: cycfg_pins.h
 *
 * Description:
 * Pin configuration
 * This file was automatically generated and should not be modified.
 * Configurator Backend 3.90.0
 * device-db 4.41.0.11271
 * mtb-pdl-cat2 2.21.0.17950
 *
 *******************************************************************************
 * Copyright 2026, Infineon Technologies AG, or an affiliate of Infineon
 * Technologies AG. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ******************************************************************************/

#if !defined(CYCFG_PINS_H)
#define CYCFG_PINS_H

#include "cycfg_notices.h"
#include "cy_gpio.h"
#include "cycfg_routing.h"

#if defined (CY_USING_HAL)
#include "cyhal_hwmgr.h"
#endif /* defined (CY_USING_HAL) */

#if defined(__cplusplus)
extern "C" {
#endif /* defined(__cplusplus) */

#define CYBSP_CS_SHIELD1_ENABLED 1U
#define CYBSP_CS_SHIELD1_PORT GPIO_PRT0
#define CYBSP_CS_SHIELD1_PORT_NUM 0U
#define CYBSP_CS_SHIELD1_PIN 0U
#define CYBSP_CS_SHIELD1_NUM 0U
#define CYBSP_CS_SHIELD1_DRIVEMODE CY_GPIO_DM_ANALOG
#define CYBSP_CS_SHIELD1_INIT_DRIVESTATE 1
#ifndef ioss_0_port_0_pin_0_HSIOM
    #define ioss_0_port_0_pin_0_HSIOM HSIOM_SEL_GPIO
#endif
#define CYBSP_CS_SHIELD1_HSIOM ioss_0_port_0_pin_0_HSIOM
#define CYBSP_CS_SHIELD1_IRQ ioss_interrupts_gpio_0_IRQn

#if defined (CY_USING_HAL)
#define CYBSP_CS_SHIELD1_HAL_PORT_PIN P0_0
#define CYBSP_CS_SHIELD1 P0_0
#define CYBSP_CS_SHIELD1_HAL_IRQ CYHAL_GPIO_IRQ_NONE
#define CYBSP_CS_SHIELD1_HAL_DIR CYHAL_GPIO_DIR_INPUT 
#define CYBSP_CS_SHIELD1_HAL_DRIVEMODE CYHAL_GPIO_DRIVE_ANALOG
#endif /* defined (CY_USING_HAL) */

#define CYBSP_CSD_PROX_ENABLED 1U
#define CYBSP_CSD_PROX_PORT GPIO_PRT0
#define CYBSP_CSD_PROX_PORT_NUM 0U
#define CYBSP_CSD_PROX_PIN 1U
#define CYBSP_CSD_PROX_NUM 1U
#define CYBSP_CSD_PROX_DRIVEMODE CY_GPIO_DM_ANALOG
#define CYBSP_CSD_PROX_INIT_DRIVESTATE 1
#ifndef ioss_0_port_0_pin_1_HSIOM
    #define ioss_0_port_0_pin_1_HSIOM HSIOM_SEL_GPIO
#endif
#define CYBSP_CSD_PROX_HSIOM ioss_0_port_0_pin_1_HSIOM
#define CYBSP_CSD_PROX_IRQ ioss_interrupts_gpio_0_IRQn

#if defined (CY_USING_HAL)
#define CYBSP_CSD_PROX_HAL_PORT_PIN P0_1
#define CYBSP_CSD_PROX P0_1
#define CYBSP_CSD_PROX_HAL_IRQ CYHAL_GPIO_IRQ_NONE
#define CYBSP_CSD_PROX_HAL_DIR CYHAL_GPIO_DIR_INPUT 
#define CYBSP_CSD_PROX_HAL_DRIVEMODE CYHAL_GPIO_DRIVE_ANALOG
#define CYBSP_CSD_TP_ROW0 (P0_4)
#define CYBSP_CSX_TP_RX0 CYBSP_CSD_TP_ROW0
#define CYBSP_CSD_TP_ROW1 (P0_5)
#define CYBSP_CSX_TP_RX1 CYBSP_CSD_TP_ROW1
#define CYBSP_CSD_TP_ROW2 (P0_6)
#define CYBSP_CSX_TP_RX2 CYBSP_CSD_TP_ROW2
#define CYBSP_CSD_TP_ROW3 (P0_7)
#define CYBSP_CSX_TP_RX3 CYBSP_CSD_TP_ROW3
#endif /* defined (CY_USING_HAL) */

#define CYBSP_CMOD1_ENABLED 1U
#define CYBSP_CMOD1_PORT GPIO_PRT1
#define CYBSP_CMOD1_PORT_NUM 1U
#define CYBSP_CMOD1_PIN 0U
#define CYBSP_CMOD1_NUM 0U
#define CYBSP_CMOD1_DRIVEMODE CY_GPIO_DM_ANALOG
#define CYBSP_CMOD1_INIT_DRIVESTATE 1
#ifndef ioss_0_port_1_pin_0_HSIOM
    #define ioss_0_port_1_pin_0_HSIOM HSIOM_SEL_GPIO
#endif
#define CYBSP_CMOD1_HSIOM ioss_0_port_1_pin_0_HSIOM
#define CYBSP_CMOD1_IRQ ioss_interrupts_gpio_1_IRQn

#if defined (CY_USING_HAL)
#define CYBSP_CMOD1_HAL_PORT_PIN P1_0
#define CYBSP_CMOD1 P1_0
#define CYBSP_CMOD1_HAL_IRQ CYHAL_GPIO_IRQ_NONE
#define CYBSP_CMOD1_HAL_DIR CYHAL_GPIO_DIR_INPUT 
#define CYBSP_CMOD1_HAL_DRIVEMODE CYHAL_GPIO_DRIVE_ANALOG
#endif /* defined (CY_USING_HAL) */

#define CYBSP_CMOD2_ENABLED 1U
#define CYBSP_CMOD2_PORT GPIO_PRT1
#define CYBSP_CMOD2_PORT_NUM 1U
#define CYBSP_CMOD2_PIN 1U
#define CYBSP_CMOD2_NUM 1U
#define CYBSP_CMOD2_DRIVEMODE CY_GPIO_DM_ANALOG
#define CYBSP_CMOD2_INIT_DRIVESTATE 1
#ifndef ioss_0_port_1_pin_1_HSIOM
    #define ioss_0_port_1_pin_1_HSIOM HSIOM_SEL_GPIO
#endif
#define CYBSP_CMOD2_HSIOM ioss_0_port_1_pin_1_HSIOM
#define CYBSP_CMOD2_IRQ ioss_interrupts_gpio_1_IRQn

#if defined (CY_USING_HAL)
#define CYBSP_CMOD2_HAL_PORT_PIN P1_1
#define CYBSP_CMOD2 P1_1
#define CYBSP_CMOD2_HAL_IRQ CYHAL_GPIO_IRQ_NONE
#define CYBSP_CMOD2_HAL_DIR CYHAL_GPIO_DIR_INPUT 
#define CYBSP_CMOD2_HAL_DRIVEMODE CYHAL_GPIO_DRIVE_ANALOG
#define CYBSP_CSD_TP_COL4 (P1_2)
#define CYBSP_CSX_TP_TX4 CYBSP_CSD_TP_COL4
#define CYBSP_CSD_TP_COL3 (P1_3)
#define CYBSP_CSX_TP_TX3 CYBSP_CSD_TP_COL3
#define CYBSP_CSD_TP_COL2 (P1_4)
#define CYBSP_CSX_TP_TX2 CYBSP_CSD_TP_COL2
#define CYBSP_CSD_TP_COL1 (P1_5)
#define CYBSP_CSX_TP_TX1 CYBSP_CSD_TP_COL1
#define CYBSP_CSD_TP_COL0 (P1_6)
#define CYBSP_CSX_TP_TX0 CYBSP_CSD_TP_COL0
#endif /* defined (CY_USING_HAL) */

#define ioss_0_port_2_pin_0_ENABLED 1U
#define ioss_0_port_2_pin_0_PORT GPIO_PRT2
#define ioss_0_port_2_pin_0_PORT_NUM 2U
#define ioss_0_port_2_pin_0_PIN 0U
#define ioss_0_port_2_pin_0_NUM 0U
#define ioss_0_port_2_pin_0_DRIVEMODE CY_GPIO_DM_ANALOG
#define ioss_0_port_2_pin_0_INIT_DRIVESTATE 1
#ifndef ioss_0_port_2_pin_0_HSIOM
    #define ioss_0_port_2_pin_0_HSIOM HSIOM_SEL_GPIO
#endif
#define ioss_0_port_2_pin_0_IRQ ioss_interrupts_gpio_2_IRQn

#if defined (CY_USING_HAL)
#define ioss_0_port_2_pin_0_HAL_PORT_PIN P2_0
#define ioss_0_port_2_pin_0 P2_0
#define ioss_0_port_2_pin_0_HAL_IRQ CYHAL_GPIO_IRQ_NONE
#define ioss_0_port_2_pin_0_HAL_DIR CYHAL_GPIO_DIR_INPUT 
#define ioss_0_port_2_pin_0_HAL_DRIVEMODE CYHAL_GPIO_DRIVE_ANALOG
#endif /* defined (CY_USING_HAL) */

#define ioss_0_port_2_pin_1_ENABLED 1U
#define ioss_0_port_2_pin_1_PORT GPIO_PRT2
#define ioss_0_port_2_pin_1_PORT_NUM 2U
#define ioss_0_port_2_pin_1_PIN 1U
#define ioss_0_port_2_pin_1_NUM 1U
#define ioss_0_port_2_pin_1_DRIVEMODE CY_GPIO_DM_ANALOG
#define ioss_0_port_2_pin_1_INIT_DRIVESTATE 1
#ifndef ioss_0_port_2_pin_1_HSIOM
    #define ioss_0_port_2_pin_1_HSIOM HSIOM_SEL_GPIO
#endif
#define ioss_0_port_2_pin_1_IRQ ioss_interrupts_gpio_2_IRQn

#if defined (CY_USING_HAL)
#define ioss_0_port_2_pin_1_HAL_PORT_PIN P2_1
#define ioss_0_port_2_pin_1 P2_1
#define ioss_0_port_2_pin_1_HAL_IRQ CYHAL_GPIO_IRQ_NONE
#define ioss_0_port_2_pin_1_HAL_DIR CYHAL_GPIO_DIR_INPUT 
#define ioss_0_port_2_pin_1_HAL_DRIVEMODE CYHAL_GPIO_DRIVE_ANALOG
#endif /* defined (CY_USING_HAL) */

#define ioss_0_port_2_pin_2_ENABLED 1U
#define ioss_0_port_2_pin_2_PORT GPIO_PRT2
#define ioss_0_port_2_pin_2_PORT_NUM 2U
#define ioss_0_port_2_pin_2_PIN 2U
#define ioss_0_port_2_pin_2_NUM 2U
#define ioss_0_port_2_pin_2_DRIVEMODE CY_GPIO_DM_ANALOG
#define ioss_0_port_2_pin_2_INIT_DRIVESTATE 1
#ifndef ioss_0_port_2_pin_2_HSIOM
    #define ioss_0_port_2_pin_2_HSIOM HSIOM_SEL_GPIO
#endif
#define ioss_0_port_2_pin_2_IRQ ioss_interrupts_gpio_2_IRQn

#if defined (CY_USING_HAL)
#define ioss_0_port_2_pin_2_HAL_PORT_PIN P2_2
#define ioss_0_port_2_pin_2 P2_2
#define ioss_0_port_2_pin_2_HAL_IRQ CYHAL_GPIO_IRQ_NONE
#define ioss_0_port_2_pin_2_HAL_DIR CYHAL_GPIO_DIR_INPUT 
#define ioss_0_port_2_pin_2_HAL_DRIVEMODE CYHAL_GPIO_DRIVE_ANALOG
#endif /* defined (CY_USING_HAL) */

#define ioss_0_port_2_pin_3_ENABLED 1U
#define ioss_0_port_2_pin_3_PORT GPIO_PRT2
#define ioss_0_port_2_pin_3_PORT_NUM 2U
#define ioss_0_port_2_pin_3_PIN 3U
#define ioss_0_port_2_pin_3_NUM 3U
#define ioss_0_port_2_pin_3_DRIVEMODE CY_GPIO_DM_ANALOG
#define ioss_0_port_2_pin_3_INIT_DRIVESTATE 1
#ifndef ioss_0_port_2_pin_3_HSIOM
    #define ioss_0_port_2_pin_3_HSIOM HSIOM_SEL_GPIO
#endif
#define ioss_0_port_2_pin_3_IRQ ioss_interrupts_gpio_2_IRQn

#if defined (CY_USING_HAL)
#define ioss_0_port_2_pin_3_HAL_PORT_PIN P2_3
#define ioss_0_port_2_pin_3 P2_3
#define ioss_0_port_2_pin_3_HAL_IRQ CYHAL_GPIO_IRQ_NONE
#define ioss_0_port_2_pin_3_HAL_DIR CYHAL_GPIO_DIR_INPUT 
#define ioss_0_port_2_pin_3_HAL_DRIVEMODE CYHAL_GPIO_DRIVE_ANALOG
#endif /* defined (CY_USING_HAL) */

#define ioss_0_port_2_pin_4_ENABLED 1U
#define ioss_0_port_2_pin_4_PORT GPIO_PRT2
#define ioss_0_port_2_pin_4_PORT_NUM 2U
#define ioss_0_port_2_pin_4_PIN 4U
#define ioss_0_port_2_pin_4_NUM 4U
#define ioss_0_port_2_pin_4_DRIVEMODE CY_GPIO_DM_ANALOG
#define ioss_0_port_2_pin_4_INIT_DRIVESTATE 1
#ifndef ioss_0_port_2_pin_4_HSIOM
    #define ioss_0_port_2_pin_4_HSIOM HSIOM_SEL_GPIO
#endif
#define ioss_0_port_2_pin_4_IRQ ioss_interrupts_gpio_2_IRQn

#if defined (CY_USING_HAL)
#define ioss_0_port_2_pin_4_HAL_PORT_PIN P2_4
#define ioss_0_port_2_pin_4 P2_4
#define ioss_0_port_2_pin_4_HAL_IRQ CYHAL_GPIO_IRQ_NONE
#define ioss_0_port_2_pin_4_HAL_DIR CYHAL_GPIO_DIR_INPUT 
#define ioss_0_port_2_pin_4_HAL_DRIVEMODE CYHAL_GPIO_DRIVE_ANALOG
#endif /* defined (CY_USING_HAL) */

#define ioss_0_port_2_pin_5_ENABLED 1U
#define ioss_0_port_2_pin_5_PORT GPIO_PRT2
#define ioss_0_port_2_pin_5_PORT_NUM 2U
#define ioss_0_port_2_pin_5_PIN 5U
#define ioss_0_port_2_pin_5_NUM 5U
#define ioss_0_port_2_pin_5_DRIVEMODE CY_GPIO_DM_ANALOG
#define ioss_0_port_2_pin_5_INIT_DRIVESTATE 1
#ifndef ioss_0_port_2_pin_5_HSIOM
    #define ioss_0_port_2_pin_5_HSIOM HSIOM_SEL_GPIO
#endif
#define ioss_0_port_2_pin_5_IRQ ioss_interrupts_gpio_2_IRQn

#if defined (CY_USING_HAL)
#define ioss_0_port_2_pin_5_HAL_PORT_PIN P2_5
#define ioss_0_port_2_pin_5 P2_5
#define ioss_0_port_2_pin_5_HAL_IRQ CYHAL_GPIO_IRQ_NONE
#define ioss_0_port_2_pin_5_HAL_DIR CYHAL_GPIO_DIR_INPUT 
#define ioss_0_port_2_pin_5_HAL_DRIVEMODE CYHAL_GPIO_DRIVE_ANALOG
#endif /* defined (CY_USING_HAL) */

#define ioss_0_port_2_pin_6_ENABLED 1U
#define ioss_0_port_2_pin_6_PORT GPIO_PRT2
#define ioss_0_port_2_pin_6_PORT_NUM 2U
#define ioss_0_port_2_pin_6_PIN 6U
#define ioss_0_port_2_pin_6_NUM 6U
#define ioss_0_port_2_pin_6_DRIVEMODE CY_GPIO_DM_ANALOG
#define ioss_0_port_2_pin_6_INIT_DRIVESTATE 1
#ifndef ioss_0_port_2_pin_6_HSIOM
    #define ioss_0_port_2_pin_6_HSIOM HSIOM_SEL_GPIO
#endif
#define ioss_0_port_2_pin_6_IRQ ioss_interrupts_gpio_2_IRQn

#if defined (CY_USING_HAL)
#define ioss_0_port_2_pin_6_HAL_PORT_PIN P2_6
#define ioss_0_port_2_pin_6 P2_6
#define ioss_0_port_2_pin_6_HAL_IRQ CYHAL_GPIO_IRQ_NONE
#define ioss_0_port_2_pin_6_HAL_DIR CYHAL_GPIO_DIR_INPUT 
#define ioss_0_port_2_pin_6_HAL_DRIVEMODE CYHAL_GPIO_DRIVE_ANALOG
#define CYBSP_ALS_ADC_IN (P2_7)
#endif /* defined (CY_USING_HAL) */

#define ioss_0_port_3_pin_1_ENABLED 1U
#define ioss_0_port_3_pin_1_PORT GPIO_PRT3
#define ioss_0_port_3_pin_1_PORT_NUM 3U
#define ioss_0_port_3_pin_1_PIN 1U
#define ioss_0_port_3_pin_1_NUM 1U
#define ioss_0_port_3_pin_1_DRIVEMODE CY_GPIO_DM_ANALOG
#define ioss_0_port_3_pin_1_INIT_DRIVESTATE 1
#ifndef ioss_0_port_3_pin_1_HSIOM
    #define ioss_0_port_3_pin_1_HSIOM HSIOM_SEL_GPIO
#endif
#define ioss_0_port_3_pin_1_IRQ ioss_interrupts_gpio_3_IRQn

#if defined (CY_USING_HAL)
#define ioss_0_port_3_pin_1_HAL_PORT_PIN P3_1
#define ioss_0_port_3_pin_1 P3_1
#define ioss_0_port_3_pin_1_HAL_IRQ CYHAL_GPIO_IRQ_NONE
#define ioss_0_port_3_pin_1_HAL_DIR CYHAL_GPIO_DIR_INPUT 
#define ioss_0_port_3_pin_1_HAL_DRIVEMODE CYHAL_GPIO_DRIVE_ANALOG
#endif /* defined (CY_USING_HAL) */

#define CYBSP_SWDIO_ENABLED 1U
#define CYBSP_SWDIO_PORT GPIO_PRT3
#define CYBSP_SWDIO_PORT_NUM 3U
#define CYBSP_SWDIO_PIN 2U
#define CYBSP_SWDIO_NUM 2U
#define CYBSP_SWDIO_DRIVEMODE CY_GPIO_DM_STRONG
#define CYBSP_SWDIO_INIT_DRIVESTATE 1
#ifndef ioss_0_port_3_pin_2_HSIOM
    #define ioss_0_port_3_pin_2_HSIOM HSIOM_SEL_GPIO
#endif
#define CYBSP_SWDIO_HSIOM ioss_0_port_3_pin_2_HSIOM
#define CYBSP_SWDIO_IRQ ioss_interrupts_gpio_3_IRQn

#if defined (CY_USING_HAL)
#define CYBSP_SWDIO_HAL_PORT_PIN P3_2
#define CYBSP_SWDIO P3_2
#define CYBSP_SWDIO_HAL_IRQ CYHAL_GPIO_IRQ_NONE
#define CYBSP_SWDIO_HAL_DIR CYHAL_GPIO_DIR_BIDIRECTIONAL 
#define CYBSP_SWDIO_HAL_DRIVEMODE CYHAL_GPIO_DRIVE_STRONG
#endif /* defined (CY_USING_HAL) */

#define CYBSP_SWDCK_ENABLED 1U
#define CYBSP_SWDCK_PORT GPIO_PRT3
#define CYBSP_SWDCK_PORT_NUM 3U
#define CYBSP_SWDCK_PIN 3U
#define CYBSP_SWDCK_NUM 3U
#define CYBSP_SWDCK_DRIVEMODE CY_GPIO_DM_STRONG
#define CYBSP_SWDCK_INIT_DRIVESTATE 1
#ifndef ioss_0_port_3_pin_3_HSIOM
    #define ioss_0_port_3_pin_3_HSIOM HSIOM_SEL_GPIO
#endif
#define CYBSP_SWDCK_HSIOM ioss_0_port_3_pin_3_HSIOM
#define CYBSP_SWDCK_IRQ ioss_interrupts_gpio_3_IRQn

#if defined (CY_USING_HAL)
#define CYBSP_SWDCK_HAL_PORT_PIN P3_3
#define CYBSP_SWDCK P3_3
#define CYBSP_SWDCK_HAL_IRQ CYHAL_GPIO_IRQ_NONE
#define CYBSP_SWDCK_HAL_DIR CYHAL_GPIO_DIR_BIDIRECTIONAL 
#define CYBSP_SWDCK_HAL_DRIVEMODE CYHAL_GPIO_DRIVE_STRONG
#endif /* defined (CY_USING_HAL) */

#define CYBSP_ISX_LED2_ENABLED 1U
#define CYBSP_ISX_LED2_PORT GPIO_PRT4
#define CYBSP_ISX_LED2_PORT_NUM 4U
#define CYBSP_ISX_LED2_PIN 0U
#define CYBSP_ISX_LED2_NUM 0U
#define CYBSP_ISX_LED2_DRIVEMODE CY_GPIO_DM_STRONG_IN_OFF
#define CYBSP_ISX_LED2_INIT_DRIVESTATE 1
#ifndef ioss_0_port_4_pin_0_HSIOM
    #define ioss_0_port_4_pin_0_HSIOM HSIOM_SEL_GPIO
#endif
#define CYBSP_ISX_LED2_HSIOM ioss_0_port_4_pin_0_HSIOM
#define CYBSP_ISX_LED2_IRQ ioss_interrupt_gpio_IRQn

#if defined (CY_USING_HAL)
#define CYBSP_ISX_LED2_HAL_PORT_PIN P4_0
#define CYBSP_ISX_LED2 P4_0
#define CYBSP_ISX_LED2_HAL_IRQ CYHAL_GPIO_IRQ_NONE
#define CYBSP_ISX_LED2_HAL_DIR CYHAL_GPIO_DIR_OUTPUT 
#define CYBSP_ISX_LED2_HAL_DRIVEMODE CYHAL_GPIO_DRIVE_STRONG
#endif /* defined (CY_USING_HAL) */

#define CYBSP_ISX_LED1_ENABLED 1U
#define CYBSP_ISX_LED1_PORT GPIO_PRT4
#define CYBSP_ISX_LED1_PORT_NUM 4U
#define CYBSP_ISX_LED1_PIN 1U
#define CYBSP_ISX_LED1_NUM 1U
#define CYBSP_ISX_LED1_DRIVEMODE CY_GPIO_DM_STRONG_IN_OFF
#define CYBSP_ISX_LED1_INIT_DRIVESTATE 1
#ifndef ioss_0_port_4_pin_1_HSIOM
    #define ioss_0_port_4_pin_1_HSIOM HSIOM_SEL_GPIO
#endif
#define CYBSP_ISX_LED1_HSIOM ioss_0_port_4_pin_1_HSIOM
#define CYBSP_ISX_LED1_IRQ ioss_interrupt_gpio_IRQn

#if defined (CY_USING_HAL)
#define CYBSP_ISX_LED1_HAL_PORT_PIN P4_1
#define CYBSP_ISX_LED1 P4_1
#define CYBSP_ISX_LED1_HAL_IRQ CYHAL_GPIO_IRQ_NONE
#define CYBSP_ISX_LED1_HAL_DIR CYHAL_GPIO_DIR_OUTPUT 
#define CYBSP_ISX_LED1_HAL_DRIVEMODE CYHAL_GPIO_DRIVE_STRONG
#endif /* defined (CY_USING_HAL) */

#define CYBSP_ISX_LED4_ENABLED 1U
#define CYBSP_ISX_LED4_PORT GPIO_PRT4
#define CYBSP_ISX_LED4_PORT_NUM 4U
#define CYBSP_ISX_LED4_PIN 2U
#define CYBSP_ISX_LED4_NUM 2U
#define CYBSP_ISX_LED4_DRIVEMODE CY_GPIO_DM_STRONG_IN_OFF
#define CYBSP_ISX_LED4_INIT_DRIVESTATE 1
#ifndef ioss_0_port_4_pin_2_HSIOM
    #define ioss_0_port_4_pin_2_HSIOM HSIOM_SEL_GPIO
#endif
#define CYBSP_ISX_LED4_HSIOM ioss_0_port_4_pin_2_HSIOM
#define CYBSP_ISX_LED4_IRQ ioss_interrupt_gpio_IRQn

#if defined (CY_USING_HAL)
#define CYBSP_ISX_LED4_HAL_PORT_PIN P4_2
#define CYBSP_ISX_LED4 P4_2
#define CYBSP_ISX_LED4_HAL_IRQ CYHAL_GPIO_IRQ_NONE
#define CYBSP_ISX_LED4_HAL_DIR CYHAL_GPIO_DIR_OUTPUT 
#define CYBSP_ISX_LED4_HAL_DRIVEMODE CYHAL_GPIO_DRIVE_STRONG
#endif /* defined (CY_USING_HAL) */

#define CYBSP_CS_SHIELD2_ENABLED 1U
#define CYBSP_CS_SHIELD2_PORT GPIO_PRT4
#define CYBSP_CS_SHIELD2_PORT_NUM 4U
#define CYBSP_CS_SHIELD2_PIN 3U
#define CYBSP_CS_SHIELD2_NUM 3U
#define CYBSP_CS_SHIELD2_DRIVEMODE CY_GPIO_DM_ANALOG
#define CYBSP_CS_SHIELD2_INIT_DRIVESTATE 1
#ifndef ioss_0_port_4_pin_3_HSIOM
    #define ioss_0_port_4_pin_3_HSIOM HSIOM_SEL_GPIO
#endif
#define CYBSP_CS_SHIELD2_HSIOM ioss_0_port_4_pin_3_HSIOM
#define CYBSP_CS_SHIELD2_IRQ ioss_interrupt_gpio_IRQn

#if defined (CY_USING_HAL)
#define CYBSP_CS_SHIELD2_HAL_PORT_PIN P4_3
#define CYBSP_CS_SHIELD2 P4_3
#define CYBSP_CS_SHIELD2_HAL_IRQ CYHAL_GPIO_IRQ_NONE
#define CYBSP_CS_SHIELD2_HAL_DIR CYHAL_GPIO_DIR_INPUT 
#define CYBSP_CS_SHIELD2_HAL_DRIVEMODE CYHAL_GPIO_DRIVE_ANALOG
#endif /* defined (CY_USING_HAL) */

#define CYBSP_CSX_BTN0_RX_ENABLED 1U
#define CYBSP_CSX_BTN0_RX_PORT GPIO_PRT4
#define CYBSP_CSX_BTN0_RX_PORT_NUM 4U
#define CYBSP_CSX_BTN0_RX_PIN 4U
#define CYBSP_CSX_BTN0_RX_NUM 4U
#define CYBSP_CSX_BTN0_RX_DRIVEMODE CY_GPIO_DM_ANALOG
#define CYBSP_CSX_BTN0_RX_INIT_DRIVESTATE 1
#ifndef ioss_0_port_4_pin_4_HSIOM
    #define ioss_0_port_4_pin_4_HSIOM HSIOM_SEL_GPIO
#endif
#define CYBSP_CSX_BTN0_RX_HSIOM ioss_0_port_4_pin_4_HSIOM
#define CYBSP_CSX_BTN0_RX_IRQ ioss_interrupt_gpio_IRQn

#if defined (CY_USING_HAL)
#define CYBSP_CSX_BTN0_RX_HAL_PORT_PIN P4_4
#define CYBSP_CSX_BTN0_RX P4_4
#define CYBSP_CSX_BTN0_RX_HAL_IRQ CYHAL_GPIO_IRQ_NONE
#define CYBSP_CSX_BTN0_RX_HAL_DIR CYHAL_GPIO_DIR_INPUT 
#define CYBSP_CSX_BTN0_RX_HAL_DRIVEMODE CYHAL_GPIO_DRIVE_ANALOG
#endif /* defined (CY_USING_HAL) */

#define CYBSP_CSD_BTN1_ENABLED 1U
#define CYBSP_CSD_BTN1_PORT GPIO_PRT4
#define CYBSP_CSD_BTN1_PORT_NUM 4U
#define CYBSP_CSD_BTN1_PIN 5U
#define CYBSP_CSD_BTN1_NUM 5U
#define CYBSP_CSD_BTN1_DRIVEMODE CY_GPIO_DM_ANALOG
#define CYBSP_CSD_BTN1_INIT_DRIVESTATE 1
#ifndef ioss_0_port_4_pin_5_HSIOM
    #define ioss_0_port_4_pin_5_HSIOM HSIOM_SEL_GPIO
#endif
#define CYBSP_CSD_BTN1_HSIOM ioss_0_port_4_pin_5_HSIOM
#define CYBSP_CSD_BTN1_IRQ ioss_interrupt_gpio_IRQn

#if defined (CY_USING_HAL)
#define CYBSP_CSD_BTN1_HAL_PORT_PIN P4_5
#define CYBSP_CSD_BTN1 P4_5
#define CYBSP_CSD_BTN1_HAL_IRQ CYHAL_GPIO_IRQ_NONE
#define CYBSP_CSD_BTN1_HAL_DIR CYHAL_GPIO_DIR_INPUT 
#define CYBSP_CSD_BTN1_HAL_DRIVEMODE CYHAL_GPIO_DRIVE_ANALOG
#endif /* defined (CY_USING_HAL) */

#define CYBSP_CSX_BTN0_TX_ENABLED 1U
#define CYBSP_CSX_BTN0_TX_PORT GPIO_PRT4
#define CYBSP_CSX_BTN0_TX_PORT_NUM 4U
#define CYBSP_CSX_BTN0_TX_PIN 6U
#define CYBSP_CSX_BTN0_TX_NUM 6U
#define CYBSP_CSX_BTN0_TX_DRIVEMODE CY_GPIO_DM_ANALOG
#define CYBSP_CSX_BTN0_TX_INIT_DRIVESTATE 1
#ifndef ioss_0_port_4_pin_6_HSIOM
    #define ioss_0_port_4_pin_6_HSIOM HSIOM_SEL_GPIO
#endif
#define CYBSP_CSX_BTN0_TX_HSIOM ioss_0_port_4_pin_6_HSIOM
#define CYBSP_CSX_BTN0_TX_IRQ ioss_interrupt_gpio_IRQn

#if defined (CY_USING_HAL)
#define CYBSP_CSX_BTN0_TX_HAL_PORT_PIN P4_6
#define CYBSP_CSX_BTN0_TX P4_6
#define CYBSP_CSX_BTN0_TX_HAL_IRQ CYHAL_GPIO_IRQ_NONE
#define CYBSP_CSX_BTN0_TX_HAL_DIR CYHAL_GPIO_DIR_INPUT 
#define CYBSP_CSX_BTN0_TX_HAL_DRIVEMODE CYHAL_GPIO_DRIVE_ANALOG
#endif /* defined (CY_USING_HAL) */

#define CYBSP_UART_RX_ENABLED 1U
#define CYBSP_UART_RX_PORT GPIO_PRT5
#define CYBSP_UART_RX_PORT_NUM 5U
#define CYBSP_UART_RX_PIN 1U
#define CYBSP_UART_RX_NUM 1U
#define CYBSP_UART_RX_DRIVEMODE CY_GPIO_DM_HIGHZ
#define CYBSP_UART_RX_INIT_DRIVESTATE 1
#ifndef ioss_0_port_5_pin_1_HSIOM
    #define ioss_0_port_5_pin_1_HSIOM HSIOM_SEL_GPIO
#endif
#define CYBSP_UART_RX_HSIOM ioss_0_port_5_pin_1_HSIOM
#define CYBSP_UART_RX_IRQ ioss_interrupt_gpio_IRQn

#if defined (CY_USING_HAL)
#define CYBSP_UART_RX_HAL_PORT_PIN P5_1
#define CYBSP_UART_RX P5_1
#define CYBSP_UART_RX_HAL_IRQ CYHAL_GPIO_IRQ_NONE
#define CYBSP_UART_RX_HAL_DIR CYHAL_GPIO_DIR_INPUT 
#define CYBSP_UART_RX_HAL_DRIVEMODE CYHAL_GPIO_DRIVE_NONE
#endif /* defined (CY_USING_HAL) */

#define CYBSP_UART_TX_ENABLED 1U
#define CYBSP_UART_TX_PORT GPIO_PRT5
#define CYBSP_UART_TX_PORT_NUM 5U
#define CYBSP_UART_TX_PIN 2U
#define CYBSP_UART_TX_NUM 2U
#define CYBSP_UART_TX_DRIVEMODE CY_GPIO_DM_STRONG_IN_OFF
#define CYBSP_UART_TX_INIT_DRIVESTATE 1
#ifndef ioss_0_port_5_pin_2_HSIOM
    #define ioss_0_port_5_pin_2_HSIOM HSIOM_SEL_GPIO
#endif
#define CYBSP_UART_TX_HSIOM ioss_0_port_5_pin_2_HSIOM
#define CYBSP_UART_TX_IRQ ioss_interrupt_gpio_IRQn

#if defined (CY_USING_HAL)
#define CYBSP_UART_TX_HAL_PORT_PIN P5_2
#define CYBSP_UART_TX P5_2
#define CYBSP_UART_TX_HAL_IRQ CYHAL_GPIO_IRQ_NONE
#define CYBSP_UART_TX_HAL_DIR CYHAL_GPIO_DIR_OUTPUT 
#define CYBSP_UART_TX_HAL_DRIVEMODE CYHAL_GPIO_DRIVE_STRONG
#endif /* defined (CY_USING_HAL) */

#define CYBSP_USER_LED2_ENABLED 1U
#define CYBSP_LED3_ENABLED CYBSP_USER_LED2_ENABLED
#define CYBSP_USER_LED2_PORT GPIO_PRT5
#define CYBSP_LED3_PORT CYBSP_USER_LED2_PORT
#define CYBSP_USER_LED2_PORT_NUM 5U
#define CYBSP_LED3_PORT_NUM CYBSP_USER_LED2_PORT_NUM
#define CYBSP_USER_LED2_PIN 4U
#define CYBSP_LED3_PIN CYBSP_USER_LED2_PIN
#define CYBSP_USER_LED2_NUM 4U
#define CYBSP_LED3_NUM CYBSP_USER_LED2_NUM
#define CYBSP_USER_LED2_DRIVEMODE CY_GPIO_DM_STRONG_IN_OFF
#define CYBSP_LED3_DRIVEMODE CYBSP_USER_LED2_DRIVEMODE
#define CYBSP_USER_LED2_INIT_DRIVESTATE 1
#define CYBSP_LED3_INIT_DRIVESTATE CYBSP_USER_LED2_INIT_DRIVESTATE
#ifndef ioss_0_port_5_pin_4_HSIOM
    #define ioss_0_port_5_pin_4_HSIOM HSIOM_SEL_GPIO
#endif
#define CYBSP_USER_LED2_HSIOM ioss_0_port_5_pin_4_HSIOM
#define CYBSP_LED3_HSIOM CYBSP_USER_LED2_HSIOM
#define CYBSP_USER_LED2_IRQ ioss_interrupt_gpio_IRQn
#define CYBSP_LED3_IRQ CYBSP_USER_LED2_IRQ

#if defined (CY_USING_HAL)
#define CYBSP_USER_LED2_HAL_PORT_PIN P5_4
#define CYBSP_LED3_HAL_PORT_PIN CYBSP_USER_LED2_HAL_PORT_PIN
#define CYBSP_USER_LED2 P5_4
#define CYBSP_LED3 CYBSP_USER_LED2
#define CYBSP_USER_LED2_HAL_IRQ CYHAL_GPIO_IRQ_NONE
#define CYBSP_LED3_HAL_IRQ CYBSP_USER_LED2_HAL_IRQ
#define CYBSP_USER_LED2_HAL_DIR CYHAL_GPIO_DIR_OUTPUT 
#define CYBSP_LED3_HAL_DIR CYBSP_USER_LED2_HAL_DIR
#define CYBSP_USER_LED2_HAL_DRIVEMODE CYHAL_GPIO_DRIVE_STRONG
#define CYBSP_LED3_HAL_DRIVEMODE CYBSP_USER_LED2_HAL_DRIVEMODE
#endif /* defined (CY_USING_HAL) */

#define CYBSP_LED2_ENABLED 1U
#define CYBSP_USER_LED_ENABLED CYBSP_LED2_ENABLED
#define CYBSP_USER_LED1_ENABLED CYBSP_LED2_ENABLED
#define CYBSP_LED2_PORT GPIO_PRT5
#define CYBSP_USER_LED_PORT CYBSP_LED2_PORT
#define CYBSP_USER_LED1_PORT CYBSP_LED2_PORT
#define CYBSP_LED2_PORT_NUM 5U
#define CYBSP_USER_LED_PORT_NUM CYBSP_LED2_PORT_NUM
#define CYBSP_USER_LED1_PORT_NUM CYBSP_LED2_PORT_NUM
#define CYBSP_LED2_PIN 5U
#define CYBSP_USER_LED_PIN CYBSP_LED2_PIN
#define CYBSP_USER_LED1_PIN CYBSP_LED2_PIN
#define CYBSP_LED2_NUM 5U
#define CYBSP_USER_LED_NUM CYBSP_LED2_NUM
#define CYBSP_USER_LED1_NUM CYBSP_LED2_NUM
#define CYBSP_LED2_DRIVEMODE CY_GPIO_DM_STRONG_IN_OFF
#define CYBSP_USER_LED_DRIVEMODE CYBSP_LED2_DRIVEMODE
#define CYBSP_USER_LED1_DRIVEMODE CYBSP_LED2_DRIVEMODE
#define CYBSP_LED2_INIT_DRIVESTATE 0
#define CYBSP_USER_LED_INIT_DRIVESTATE CYBSP_LED2_INIT_DRIVESTATE
#define CYBSP_USER_LED1_INIT_DRIVESTATE CYBSP_LED2_INIT_DRIVESTATE
#ifndef ioss_0_port_5_pin_5_HSIOM
    #define ioss_0_port_5_pin_5_HSIOM HSIOM_SEL_GPIO
#endif
#define CYBSP_LED2_HSIOM ioss_0_port_5_pin_5_HSIOM
#define CYBSP_USER_LED_HSIOM CYBSP_LED2_HSIOM
#define CYBSP_USER_LED1_HSIOM CYBSP_LED2_HSIOM
#define CYBSP_LED2_IRQ ioss_interrupt_gpio_IRQn
#define CYBSP_USER_LED_IRQ CYBSP_LED2_IRQ
#define CYBSP_USER_LED1_IRQ CYBSP_LED2_IRQ

#if defined (CY_USING_HAL)
#define CYBSP_LED2_HAL_PORT_PIN P5_5
#define CYBSP_USER_LED_HAL_PORT_PIN CYBSP_LED2_HAL_PORT_PIN
#define CYBSP_USER_LED1_HAL_PORT_PIN CYBSP_LED2_HAL_PORT_PIN
#define CYBSP_LED2 P5_5
#define CYBSP_USER_LED CYBSP_LED2
#define CYBSP_USER_LED1 CYBSP_LED2
#define CYBSP_LED2_HAL_IRQ CYHAL_GPIO_IRQ_NONE
#define CYBSP_USER_LED_HAL_IRQ CYBSP_LED2_HAL_IRQ
#define CYBSP_USER_LED1_HAL_IRQ CYBSP_LED2_HAL_IRQ
#define CYBSP_LED2_HAL_DIR CYHAL_GPIO_DIR_OUTPUT 
#define CYBSP_USER_LED_HAL_DIR CYBSP_LED2_HAL_DIR
#define CYBSP_USER_LED1_HAL_DIR CYBSP_LED2_HAL_DIR
#define CYBSP_LED2_HAL_DRIVEMODE CYHAL_GPIO_DRIVE_STRONG
#define CYBSP_USER_LED_HAL_DRIVEMODE CYBSP_LED2_HAL_DRIVEMODE
#define CYBSP_USER_LED1_HAL_DRIVEMODE CYBSP_LED2_HAL_DRIVEMODE
#define CYBSP_SW4 (P5_6)
#define CYBSP_USER_BTN1 CYBSP_SW4
#define CYBSP_USER_BTN CYBSP_SW4
#define CYBSP_USER_LED3 (P6_0)
#define CYBSP_LED5 CYBSP_USER_LED3
#endif /* defined (CY_USING_HAL) */

#define CYBSP_USER_LED4_ENABLED 1U
#define CYBSP_LED6_ENABLED CYBSP_USER_LED4_ENABLED
#define CYBSP_ISX_LED3_ENABLED CYBSP_USER_LED4_ENABLED
#define CYBSP_USER_LED4_PORT GPIO_PRT6
#define CYBSP_LED6_PORT CYBSP_USER_LED4_PORT
#define CYBSP_ISX_LED3_PORT CYBSP_USER_LED4_PORT
#define CYBSP_USER_LED4_PORT_NUM 6U
#define CYBSP_LED6_PORT_NUM CYBSP_USER_LED4_PORT_NUM
#define CYBSP_ISX_LED3_PORT_NUM CYBSP_USER_LED4_PORT_NUM
#define CYBSP_USER_LED4_PIN 2U
#define CYBSP_LED6_PIN CYBSP_USER_LED4_PIN
#define CYBSP_ISX_LED3_PIN CYBSP_USER_LED4_PIN
#define CYBSP_USER_LED4_NUM 2U
#define CYBSP_LED6_NUM CYBSP_USER_LED4_NUM
#define CYBSP_ISX_LED3_NUM CYBSP_USER_LED4_NUM
#define CYBSP_USER_LED4_DRIVEMODE CY_GPIO_DM_STRONG_IN_OFF
#define CYBSP_LED6_DRIVEMODE CYBSP_USER_LED4_DRIVEMODE
#define CYBSP_ISX_LED3_DRIVEMODE CYBSP_USER_LED4_DRIVEMODE
#define CYBSP_USER_LED4_INIT_DRIVESTATE 1
#define CYBSP_LED6_INIT_DRIVESTATE CYBSP_USER_LED4_INIT_DRIVESTATE
#define CYBSP_ISX_LED3_INIT_DRIVESTATE CYBSP_USER_LED4_INIT_DRIVESTATE
#ifndef ioss_0_port_6_pin_2_HSIOM
    #define ioss_0_port_6_pin_2_HSIOM HSIOM_SEL_GPIO
#endif
#define CYBSP_USER_LED4_HSIOM ioss_0_port_6_pin_2_HSIOM
#define CYBSP_LED6_HSIOM CYBSP_USER_LED4_HSIOM
#define CYBSP_ISX_LED3_HSIOM CYBSP_USER_LED4_HSIOM
#define CYBSP_USER_LED4_IRQ ioss_interrupt_gpio_IRQn
#define CYBSP_LED6_IRQ CYBSP_USER_LED4_IRQ
#define CYBSP_ISX_LED3_IRQ CYBSP_USER_LED4_IRQ

#if defined (CY_USING_HAL)
#define CYBSP_USER_LED4_HAL_PORT_PIN P6_2
#define CYBSP_LED6_HAL_PORT_PIN CYBSP_USER_LED4_HAL_PORT_PIN
#define CYBSP_ISX_LED3_HAL_PORT_PIN CYBSP_USER_LED4_HAL_PORT_PIN
#define CYBSP_USER_LED4 P6_2
#define CYBSP_LED6 CYBSP_USER_LED4
#define CYBSP_ISX_LED3 CYBSP_USER_LED4
#define CYBSP_USER_LED4_HAL_IRQ CYHAL_GPIO_IRQ_NONE
#define CYBSP_LED6_HAL_IRQ CYBSP_USER_LED4_HAL_IRQ
#define CYBSP_ISX_LED3_HAL_IRQ CYBSP_USER_LED4_HAL_IRQ
#define CYBSP_USER_LED4_HAL_DIR CYHAL_GPIO_DIR_OUTPUT 
#define CYBSP_LED6_HAL_DIR CYBSP_USER_LED4_HAL_DIR
#define CYBSP_ISX_LED3_HAL_DIR CYBSP_USER_LED4_HAL_DIR
#define CYBSP_USER_LED4_HAL_DRIVEMODE CYHAL_GPIO_DRIVE_STRONG
#define CYBSP_LED6_HAL_DRIVEMODE CYBSP_USER_LED4_HAL_DRIVEMODE
#define CYBSP_ISX_LED3_HAL_DRIVEMODE CYBSP_USER_LED4_HAL_DRIVEMODE
#endif /* defined (CY_USING_HAL) */

#define CYBSP_I2C_SCL_ENABLED 1U
#define CYBSP_I2C_SCL_PORT GPIO_PRT6
#define CYBSP_I2C_SCL_PORT_NUM 6U
#define CYBSP_I2C_SCL_PIN 3U
#define CYBSP_I2C_SCL_NUM 3U
#define CYBSP_I2C_SCL_DRIVEMODE CY_GPIO_DM_OD_DRIVESLOW
#define CYBSP_I2C_SCL_INIT_DRIVESTATE 1
#ifndef ioss_0_port_6_pin_3_HSIOM
    #define ioss_0_port_6_pin_3_HSIOM HSIOM_SEL_GPIO
#endif
#define CYBSP_I2C_SCL_HSIOM ioss_0_port_6_pin_3_HSIOM
#define CYBSP_I2C_SCL_IRQ ioss_interrupt_gpio_IRQn

#if defined (CY_USING_HAL)
#define CYBSP_I2C_SCL_HAL_PORT_PIN P6_3
#define CYBSP_I2C_SCL P6_3
#define CYBSP_I2C_SCL_HAL_IRQ CYHAL_GPIO_IRQ_NONE
#define CYBSP_I2C_SCL_HAL_DIR CYHAL_GPIO_DIR_BIDIRECTIONAL 
#define CYBSP_I2C_SCL_HAL_DRIVEMODE CYHAL_GPIO_DRIVE_OPENDRAINDRIVESLOW
#endif /* defined (CY_USING_HAL) */

#define CYBSP_I2C_SDA_ENABLED 1U
#define CYBSP_I2C_SDA_PORT GPIO_PRT6
#define CYBSP_I2C_SDA_PORT_NUM 6U
#define CYBSP_I2C_SDA_PIN 4U
#define CYBSP_I2C_SDA_NUM 4U
#define CYBSP_I2C_SDA_DRIVEMODE CY_GPIO_DM_OD_DRIVESLOW
#define CYBSP_I2C_SDA_INIT_DRIVESTATE 1
#ifndef ioss_0_port_6_pin_4_HSIOM
    #define ioss_0_port_6_pin_4_HSIOM HSIOM_SEL_GPIO
#endif
#define CYBSP_I2C_SDA_HSIOM ioss_0_port_6_pin_4_HSIOM
#define CYBSP_I2C_SDA_IRQ ioss_interrupt_gpio_IRQn

#if defined (CY_USING_HAL)
#define CYBSP_I2C_SDA_HAL_PORT_PIN P6_4
#define CYBSP_I2C_SDA P6_4
#define CYBSP_I2C_SDA_HAL_IRQ CYHAL_GPIO_IRQ_NONE
#define CYBSP_I2C_SDA_HAL_DIR CYHAL_GPIO_DIR_BIDIRECTIONAL 
#define CYBSP_I2C_SDA_HAL_DRIVEMODE CYHAL_GPIO_DRIVE_OPENDRAINDRIVESLOW
#endif /* defined (CY_USING_HAL) */

extern const cy_stc_gpio_pin_config_t CYBSP_CS_SHIELD1_config;

#if defined (CY_USING_HAL)
extern const cyhal_resource_inst_t CYBSP_CS_SHIELD1_obj;
#endif /* defined (CY_USING_HAL) */

extern const cy_stc_gpio_pin_config_t CYBSP_CSD_PROX_config;

#if defined (CY_USING_HAL)
extern const cyhal_resource_inst_t CYBSP_CSD_PROX_obj;
#endif /* defined (CY_USING_HAL) */

extern const cy_stc_gpio_pin_config_t CYBSP_CMOD1_config;

#if defined (CY_USING_HAL)
extern const cyhal_resource_inst_t CYBSP_CMOD1_obj;
#endif /* defined (CY_USING_HAL) */

extern const cy_stc_gpio_pin_config_t CYBSP_CMOD2_config;

#if defined (CY_USING_HAL)
extern const cyhal_resource_inst_t CYBSP_CMOD2_obj;
#endif /* defined (CY_USING_HAL) */

extern const cy_stc_gpio_pin_config_t ioss_0_port_2_pin_0_config;

#if defined (CY_USING_HAL)
extern const cyhal_resource_inst_t ioss_0_port_2_pin_0_obj;
#endif /* defined (CY_USING_HAL) */

extern const cy_stc_gpio_pin_config_t ioss_0_port_2_pin_1_config;

#if defined (CY_USING_HAL)
extern const cyhal_resource_inst_t ioss_0_port_2_pin_1_obj;
#endif /* defined (CY_USING_HAL) */

extern const cy_stc_gpio_pin_config_t ioss_0_port_2_pin_2_config;

#if defined (CY_USING_HAL)
extern const cyhal_resource_inst_t ioss_0_port_2_pin_2_obj;
#endif /* defined (CY_USING_HAL) */

extern const cy_stc_gpio_pin_config_t ioss_0_port_2_pin_3_config;

#if defined (CY_USING_HAL)
extern const cyhal_resource_inst_t ioss_0_port_2_pin_3_obj;
#endif /* defined (CY_USING_HAL) */

extern const cy_stc_gpio_pin_config_t ioss_0_port_2_pin_4_config;

#if defined (CY_USING_HAL)
extern const cyhal_resource_inst_t ioss_0_port_2_pin_4_obj;
#endif /* defined (CY_USING_HAL) */

extern const cy_stc_gpio_pin_config_t ioss_0_port_2_pin_5_config;

#if defined (CY_USING_HAL)
extern const cyhal_resource_inst_t ioss_0_port_2_pin_5_obj;
#endif /* defined (CY_USING_HAL) */

extern const cy_stc_gpio_pin_config_t ioss_0_port_2_pin_6_config;

#if defined (CY_USING_HAL)
extern const cyhal_resource_inst_t ioss_0_port_2_pin_6_obj;
#endif /* defined (CY_USING_HAL) */

extern const cy_stc_gpio_pin_config_t ioss_0_port_3_pin_1_config;

#if defined (CY_USING_HAL)
extern const cyhal_resource_inst_t ioss_0_port_3_pin_1_obj;
#endif /* defined (CY_USING_HAL) */

extern const cy_stc_gpio_pin_config_t CYBSP_SWDIO_config;

#if defined (CY_USING_HAL)
extern const cyhal_resource_inst_t CYBSP_SWDIO_obj;
#endif /* defined (CY_USING_HAL) */

extern const cy_stc_gpio_pin_config_t CYBSP_SWDCK_config;

#if defined (CY_USING_HAL)
extern const cyhal_resource_inst_t CYBSP_SWDCK_obj;
#endif /* defined (CY_USING_HAL) */

extern const cy_stc_gpio_pin_config_t CYBSP_ISX_LED2_config;

#if defined (CY_USING_HAL)
extern const cyhal_resource_inst_t CYBSP_ISX_LED2_obj;
#endif /* defined (CY_USING_HAL) */

extern const cy_stc_gpio_pin_config_t CYBSP_ISX_LED1_config;

#if defined (CY_USING_HAL)
extern const cyhal_resource_inst_t CYBSP_ISX_LED1_obj;
#endif /* defined (CY_USING_HAL) */

extern const cy_stc_gpio_pin_config_t CYBSP_ISX_LED4_config;

#if defined (CY_USING_HAL)
extern const cyhal_resource_inst_t CYBSP_ISX_LED4_obj;
#endif /* defined (CY_USING_HAL) */

extern const cy_stc_gpio_pin_config_t CYBSP_CS_SHIELD2_config;

#if defined (CY_USING_HAL)
extern const cyhal_resource_inst_t CYBSP_CS_SHIELD2_obj;
#endif /* defined (CY_USING_HAL) */

extern const cy_stc_gpio_pin_config_t CYBSP_CSX_BTN0_RX_config;

#if defined (CY_USING_HAL)
extern const cyhal_resource_inst_t CYBSP_CSX_BTN0_RX_obj;
#endif /* defined (CY_USING_HAL) */

extern const cy_stc_gpio_pin_config_t CYBSP_CSD_BTN1_config;

#if defined (CY_USING_HAL)
extern const cyhal_resource_inst_t CYBSP_CSD_BTN1_obj;
#endif /* defined (CY_USING_HAL) */

extern const cy_stc_gpio_pin_config_t CYBSP_CSX_BTN0_TX_config;

#if defined (CY_USING_HAL)
extern const cyhal_resource_inst_t CYBSP_CSX_BTN0_TX_obj;
#endif /* defined (CY_USING_HAL) */

extern const cy_stc_gpio_pin_config_t CYBSP_UART_RX_config;

#if defined (CY_USING_HAL)
extern const cyhal_resource_inst_t CYBSP_UART_RX_obj;
#endif /* defined (CY_USING_HAL) */

extern const cy_stc_gpio_pin_config_t CYBSP_UART_TX_config;

#if defined (CY_USING_HAL)
extern const cyhal_resource_inst_t CYBSP_UART_TX_obj;
#endif /* defined (CY_USING_HAL) */

extern const cy_stc_gpio_pin_config_t CYBSP_USER_LED2_config;

#define CYBSP_LED3_config CYBSP_USER_LED2_config

#if defined (CY_USING_HAL)
extern const cyhal_resource_inst_t CYBSP_USER_LED2_obj;
#define CYBSP_LED3_obj CYBSP_USER_LED2_obj
#endif /* defined (CY_USING_HAL) */

extern const cy_stc_gpio_pin_config_t CYBSP_LED2_config;

#define CYBSP_USER_LED_config CYBSP_LED2_config
#define CYBSP_USER_LED1_config CYBSP_LED2_config

#if defined (CY_USING_HAL)
extern const cyhal_resource_inst_t CYBSP_LED2_obj;
#define CYBSP_USER_LED_obj CYBSP_LED2_obj
#define CYBSP_USER_LED1_obj CYBSP_LED2_obj
#endif /* defined (CY_USING_HAL) */

extern const cy_stc_gpio_pin_config_t CYBSP_USER_LED4_config;

#define CYBSP_LED6_config CYBSP_USER_LED4_config
#define CYBSP_ISX_LED3_config CYBSP_USER_LED4_config

#if defined (CY_USING_HAL)
extern const cyhal_resource_inst_t CYBSP_USER_LED4_obj;
#define CYBSP_LED6_obj CYBSP_USER_LED4_obj
#define CYBSP_ISX_LED3_obj CYBSP_USER_LED4_obj
#endif /* defined (CY_USING_HAL) */

extern const cy_stc_gpio_pin_config_t CYBSP_I2C_SCL_config;

#if defined (CY_USING_HAL)
extern const cyhal_resource_inst_t CYBSP_I2C_SCL_obj;
#endif /* defined (CY_USING_HAL) */

extern const cy_stc_gpio_pin_config_t CYBSP_I2C_SDA_config;

#if defined (CY_USING_HAL)
extern const cyhal_resource_inst_t CYBSP_I2C_SDA_obj;
#endif /* defined (CY_USING_HAL) */

void init_cycfg_pins(void);
void reserve_cycfg_pins(void);

#if defined(__cplusplus)
}
#endif /* defined(__cplusplus) */

#endif /* CYCFG_PINS_H */
