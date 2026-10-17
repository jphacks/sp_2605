/*******************************************************************************
 * File Name: cycfg_peripherals.c
 *
 * Description:
 * Clock configuration
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

#include "cycfg_peripherals.h"

const cy_stc_scb_ezi2c_config_t CYBSP_EZI2C_config =
{
    .numberOfAddresses = CY_SCB_EZI2C_ONE_ADDRESS,
    .slaveAddress1 = 8U,
    .slaveAddress2 = 0U,
    .subAddressSize = CY_SCB_EZI2C_SUB_ADDR16_BITS,
    .enableWakeFromSleep = false,
};

#if defined (CY_USING_HAL)
const cyhal_resource_inst_t CYBSP_EZI2C_obj =
{
    .type = CYHAL_RSC_SCB,
    .block_num = 1U,
    .channel_num = 0U,
};
#endif /* defined (CY_USING_HAL) */

cy_stc_msclp_context_t cy_msclp_0_context =
{
    .lockKey = CY_MSCLP_NONE_KEY,
};

void init_cycfg_peripherals(void)
{
    Cy_SysClk_PeriphAssignDivider(PCLK_SCB1_CLOCK, CY_SYSCLK_DIV_16_BIT, 0U);
}
void reserve_cycfg_peripherals(void)
{
#if defined (CY_USING_HAL)
    cyhal_hwmgr_reserve(&CYBSP_EZI2C_obj);
#endif /* defined (CY_USING_HAL) */
}
