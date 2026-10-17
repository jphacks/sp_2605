/******************************************************************************
 * File Name:   main.c
 *
 * Description: This is the source code for the PSoC 4: MSCLP low-power self-capacitance button
 *              Example for ModusToolbox.
 *
 * Related Document: See README.md
 *
 *
 *******************************************************************************
 * $ Copyright 2021-2023 Cypress Semiconductor $
 *******************************************************************************/

/*******************************************************************************
 * Include header files
 ******************************************************************************/
#include "cy_pdl.h"
#include "cybsp.h"
#include "cycfg.h"
#include "cycfg_capsense.h"

/*******************************************************************************
 * User configurable Macros
 ********************************************************************************/
/* シン呼吸：指穴4つの状態を KitProg3 の USB-UART（115200bps）へ「T:0101」の形で送る。
 * 指穴1 = P2.3、指穴2 = P2.0、指穴3 = P2.1、指穴4 = P2.2。
 * どれも CSD（自己容量）ボタン。外付けのアルミ電極を電線でつなぐ。電極をつないでから基板を起動すること（起動時に自動調整するため）。
 * 状態が変わった時と、変わらなくても約0.2秒ごとに送る（PC側がつなぎ直しても状態がわかるように）。 */
#define UART_CLK_DIV_NUM                (2u)   /* 16bit 分周器 0・1 は CAPSENSE 側が使用中 */
#define UART_CLK_DIV_VALUE              (51u)  /* 48MHz / 52 / oversample 8 ≒ 115200bps */
#define TOUCH_REPORT_INTERVAL           (40u)  /* 何回のスキャンごとに状態を送り直すか */


/*******************************************************************************
 * Fixed Macros
 *******************************************************************************/
#define CAPSENSE_MSC0_INTR_PRIORITY     (3u)
#define CY_ASSERT_FAILED                (0u)
#define CAPSENSE_WIDGET_INACTIVE        (1u)
#define CYBSP_LED_ON                    (0u)
#define CYBSP_LED_OFF                   (1u)

/* EZI2C interrupt priority must be higher than CAPSENSE&trade; interrupt. */
#define EZI2C_INTR_PRIORITY             (2u)


/*******************************************************************************
 * Global Variables
 *******************************************************************************/
cy_stc_scb_ezi2c_context_t ezi2c_context;
cy_stc_scb_uart_context_t uart_context;

/* Hello World サンプル（CY8CPROTO-041TP）の UART 設定をそのまま使う */
static const cy_stc_scb_uart_config_t uart_config =
{
    .uartMode = CY_SCB_UART_STANDARD,
    .oversample = 8,
    .dataWidth = 8UL,
    .parity = CY_SCB_UART_PARITY_NONE,
    .stopBits = CY_SCB_UART_STOP_BITS_1,
    .breakWidth = 11UL,
    .ctsPolarity = CY_SCB_UART_ACTIVE_LOW,
    .rtsPolarity = CY_SCB_UART_ACTIVE_LOW,
    .rxFifoTriggerLevel = 7UL,
};

/*******************************************************************************
 * Function Prototypes
 *******************************************************************************/
static void initialize_uart(void);
static void report_touch(void);
static void initialize_capsense(void);
static void capsense_msc0_isr(void);
static void ezi2c_isr(void);
static void initialize_capsense_tuner(void);
void led_control();


/*******************************************************************************
 * Function Name: main
 ********************************************************************************
 * Summary:
 *  System entrance point. This function performs
 *  - initial setup of device
 *  - initialize CAPSENSE&trade;
 *  - initialize tuner communication
 *  - scan touch input continuously
 *  - user LED for touch indication
 *
 * Return:
 *  int
 *
 *******************************************************************************/
int main(void)
{
    cy_rslt_t result;

    /* Initialize the device and board peripherals */
    result = cybsp_init();

    /* Board init failed. Stop program execution */
    if (result != CY_RSLT_SUCCESS)
    {
        CY_ASSERT(CY_ASSERT_FAILED);
    }

    /* Enable global interrupts */
    __enable_irq();

    /* Initialize EZI2C */
    initialize_capsense_tuner();

    /* Initialize MSC CAPSENSE */
    initialize_capsense();

    /* PC へ指穴の状態を送る UART */
    initialize_uart();

    for (;;)
    {
        /* 指穴1〜4（CSD ボタン4つ）をまとめてスキャン */
        Cy_CapSense_ScanAllSlots(&cy_capsense_context);
        while(Cy_CapSense_IsBusy(&cy_capsense_context)){}

        /* Process all the widgets */
        Cy_CapSense_ProcessAllWidgets(&cy_capsense_context);

        /* Send capsense data to the Tuner */
        Cy_CapSense_RunTuner(&cy_capsense_context);

        led_control();

        report_touch();
    }
}

/*******************************************************************************
 * Function Name: initialize_uart
 ********************************************************************************
 * Summary:
 *  SCB0 を UART として P5.1(RX) / P5.2(TX) に出す。KitProg3 の USB-UART につながっている。
 *******************************************************************************/
static void initialize_uart(void)
{
    Cy_SysClk_PeriphDisableDivider(CY_SYSCLK_DIV_16_BIT, UART_CLK_DIV_NUM);
    Cy_SysClk_PeriphSetDivider(CY_SYSCLK_DIV_16_BIT, UART_CLK_DIV_NUM, UART_CLK_DIV_VALUE);
    Cy_SysClk_PeriphEnableDivider(CY_SYSCLK_DIV_16_BIT, UART_CLK_DIV_NUM);
    Cy_SysClk_PeriphAssignDivider(PCLK_SCB0_CLOCK, CY_SYSCLK_DIV_16_BIT, UART_CLK_DIV_NUM);

    Cy_GPIO_Pin_FastInit(CYBSP_UART_RX_PORT, CYBSP_UART_RX_PIN, CY_GPIO_DM_HIGHZ, 1u, P5_1_SCB0_UART_RX);
    Cy_GPIO_Pin_FastInit(CYBSP_UART_TX_PORT, CYBSP_UART_TX_PIN, CY_GPIO_DM_STRONG_IN_OFF, 1u, P5_2_SCB0_UART_TX);

    Cy_SCB_UART_Init(SCB0, &uart_config, &uart_context);
    Cy_SCB_UART_Enable(SCB0);
    Cy_SCB_UART_PutString(SCB0, "AIR-OCARINA TOUCH\r\n");
}

/*******************************************************************************
 * Function Name: report_touch
 ********************************************************************************
 * Summary:
 *  指穴4つの状態を「T:0101」の形で送る。変化した時と、一定回数ごとに送る。
 *******************************************************************************/
static void report_touch(void)
{
    static const uint32_t widgets[4] =
    {
        CY_CAPSENSE_HOLE1_WDGT_ID,
        CY_CAPSENSE_HOLE2_WDGT_ID,
        CY_CAPSENSE_HOLE3_WDGT_ID,
        CY_CAPSENSE_HOLE4_WDGT_ID,
    };
    static char last[4] = { 'x', 'x', 'x', 'x' };
    static uint32_t count = 0u;
    char line[] = "T:0000\r\n";
    bool changed = false;

    for (uint32_t i = 0u; i < 4u; i++)
    {
        /* Cy_CapSense_IsWidgetActive は触れている時に 0 以外を返す */
        char c = (0u != Cy_CapSense_IsWidgetActive(widgets[i], &cy_capsense_context)) ? '1' : '0';
        line[2u + i] = c;
        if (c != last[i])
        {
            last[i] = c;
            changed = true;
        }
    }

    count++;
    if (changed || (count >= TOUCH_REPORT_INTERVAL))
    {
        count = 0u;
        Cy_SCB_UART_PutString(SCB0, line);
    }
}

/*******************************************************************************
 * Function Name: initialize_capsense
 ********************************************************************************
 * Summary:
 *  This function initializes the CAPSENSE&trade; and configures the CAPSENSE&trade;
 *  interrupt.
 *
 *******************************************************************************/
static void initialize_capsense(void)
{
    cy_capsense_status_t status = CY_CAPSENSE_STATUS_SUCCESS;

    /* CAPSENSE&trade; interrupt configuration MSCLP 0 */
    const cy_stc_sysint_t capsense_msc0_interrupt_config =
    {
            .intrSrc = CY_MSCLP0_LP_IRQ,
            .intrPriority = CAPSENSE_MSC0_INTR_PRIORITY,
    };

    /* Capture the MSC HW block and initialize it to the default state. */
    status = Cy_CapSense_Init(&cy_capsense_context);

    if (CY_CAPSENSE_STATUS_SUCCESS == status)
    {
        /* Initialize CAPSENSE&trade; interrupt for MSC 0 */
        Cy_SysInt_Init(&capsense_msc0_interrupt_config, capsense_msc0_isr);
        NVIC_ClearPendingIRQ(capsense_msc0_interrupt_config.intrSrc);
        NVIC_EnableIRQ(capsense_msc0_interrupt_config.intrSrc);

        status = Cy_CapSense_Enable(&cy_capsense_context);
    }

    if(status != CY_CAPSENSE_STATUS_SUCCESS)
    {
        /* This status could fail before tuning the sensors correctly.
         * Ensure that this function passes after the CAPSENSE&trade; sensors are tuned
         * as per procedure give in the Readme.md file */
    }
}

/*******************************************************************************
 * Function Name: capsense_msc0_isr
 ********************************************************************************
 * Summary:
 *  Wrapper function for handling interrupts from CAPSENSE&trade; MSC0 block.
 *
 *******************************************************************************/
static void capsense_msc0_isr(void)
{
    Cy_CapSense_InterruptHandler(CY_MSCLP0_HW, &cy_capsense_context);
}

/*******************************************************************************
 * Function Name: initialize_capsense_tuner
 ********************************************************************************
 * Summary:
 *  EZI2C module to communicate with the CAPSENSE&trade; Tuner tool.
 *
 *******************************************************************************/
static void initialize_capsense_tuner(void)
{
    cy_en_scb_ezi2c_status_t status = CY_SCB_EZI2C_SUCCESS;

    /* EZI2C interrupt configuration structure */
    const cy_stc_sysint_t ezi2c_intr_config =
    {
            .intrSrc = CYBSP_EZI2C_IRQ,
            .intrPriority = EZI2C_INTR_PRIORITY,
    };

    /* Initialize the EzI2C firmware module */
    status = Cy_SCB_EZI2C_Init(CYBSP_EZI2C_HW, &CYBSP_EZI2C_config, &ezi2c_context);

    if(status != CY_SCB_EZI2C_SUCCESS)
    {
        CY_ASSERT(CY_ASSERT_FAILED);
    }

    Cy_SysInt_Init(&ezi2c_intr_config, ezi2c_isr);
    NVIC_EnableIRQ(ezi2c_intr_config.intrSrc);

    /* Set the CAPSENSE&trade; data structure as the I2C buffer to be exposed to the
     * master on primary slave address interface. Any I2C host tools such as
     * the Tuner or the Bridge Control Panel can read this buffer but you can
     * connect only one tool at a time.
     */
    Cy_SCB_EZI2C_SetBuffer1(CYBSP_EZI2C_HW, (uint8_t *)&cy_capsense_tuner,
            sizeof(cy_capsense_tuner), sizeof(cy_capsense_tuner),
            &ezi2c_context);

    Cy_SCB_EZI2C_Enable(CYBSP_EZI2C_HW);

}

/*******************************************************************************
 * Function Name: ezi2c_isr
 ********************************************************************************
 * Summary:
 *  Wrapper function for handling interrupts from EZI2C block.
 *
 *******************************************************************************/
static void ezi2c_isr(void)
{
    Cy_SCB_EZI2C_Interrupt(CYBSP_EZI2C_HW, &ezi2c_context);
}

/*******************************************************************************
 * Function Name: led_control
 ********************************************************************************
 * Summary:
 *  Control LEDs in the kit to show touch activation of different sensors
 *******************************************************************************/
void led_control()
{

    /* 基板の LED2・LED1 で指穴1・2の状態を表示（元のサンプルと同じ書き方） */
    if (CAPSENSE_WIDGET_INACTIVE != Cy_CapSense_IsWidgetActive(CY_CAPSENSE_HOLE1_WDGT_ID, &cy_capsense_context))
    {
        Cy_GPIO_Write(CYBSP_USER_LED2_PORT, CYBSP_USER_LED2_NUM, CYBSP_LED_ON);
    }
    else
    {
        Cy_GPIO_Write(CYBSP_USER_LED2_PORT, CYBSP_USER_LED2_NUM, CYBSP_LED_OFF);
    }

    if (CAPSENSE_WIDGET_INACTIVE != Cy_CapSense_IsWidgetActive(CY_CAPSENSE_HOLE2_WDGT_ID, &cy_capsense_context))
    {
        Cy_GPIO_Write(CYBSP_USER_LED1_PORT, CYBSP_USER_LED1_NUM, CYBSP_LED_ON);
    }
    else
    {
        Cy_GPIO_Write(CYBSP_USER_LED1_PORT, CYBSP_USER_LED1_NUM, CYBSP_LED_OFF);
    }
}

/* [] END OF FILE */
