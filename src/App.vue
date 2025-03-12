<script setup lang="ts">
import { ref } from 'vue';
import { useTaxCalculation } from './composables/useTaxCalculation';
import { useDarkMode } from './composables/useDarkMode';
import TaxCalculationSteps from './components/TaxCalculationSteps.vue';
import NumberInput from './components/NumberInput.vue';

const leistung = ref<number>(0);
const gewicht = ref<number>(0);
const { darkMode, toggleDarkMode } = useDarkMode();
const { result, formatCurrency } = useTaxCalculation(leistung, gewicht);
</script>

<template>
  <div :class="{ 'dark': darkMode }">
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200 text-gray-700 dark:text-gray-300">
      <div class="container mx-auto px-4 py-8">
        <header class="mb-8 text-center">
          <div class="flex justify-center items-center mb-4 relative">
            <h1 class="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white text-pretty">
              Öster&shy;reichischer E-Auto Versicherungs&shy;steuer&shy;rechner
            </h1>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Berechnen Sie Ihre monatliche Versicherungssteuer für Elektrofahrzeuge nach den neuen österreichischen Bestimmungen.*
          </p>
        </header>
        
        <div class="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div class="space-y-6">
            <NumberInput
              v-model="leistung"
              id="leistung"
              label="Motorleistung (kW) Ihres Fahrzeugs"
              hint="45 kW werden abgezogen, mindestens 10 kW werden berechnet."
              placeholder="z.B. 150"
            />

            <NumberInput
              v-model="gewicht"
              id="gewicht"
              label="Eigengewicht (kg) Ihres Fahrzeugs"
              hint="900 kg werden abgezogen, mindestens 200 kg werden berechnet."
              placeholder="z.B. 1800"
            />
          </div>

          <div v-if="result" class="mt-8">
            <div class="mb-8 p-4 bg-green-50 dark:bg-green-900 rounded-md">
              <p class="text-lg font-bold text-green-800 dark:text-green-200">
                Monatliche Steuer: {{ formatCurrency(result.monthlyTotal) }}<br>
                Jährliche Steuer: {{ formatCurrency(result.monthlyTotal * 12) }}
              </p>
            </div>
          </div>

          <details>
            <summary class="font-bold mb-2">Berechnungsdetails</summary>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TaxCalculationSteps 
                title="Leistungsabhängige Steuer:" 
                :steps="result.powerSteps" 
              />
              
              <TaxCalculationSteps 
                title="Gewichtsabhängige Steuer:" 
                :steps="result.weightSteps" 
              />
            </div>
          </details>

          <footer class="flex flex-col items-center mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p class="text-xs text-gray-500 dark:text-gray-400">
              * Stand: 06.03.2025. Die Berechnungen basieren auf inoffiziellen Informationen zum geplanten Gesetz und können sich vor der endgültigen Gesetzgebung noch ändern. 
              Alle Angaben ohne Gewähr.
            </p>
            <button
              @click="toggleDarkMode"
              class="mt-8 p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
              aria-label="Dark Mode umschalten"
            >
              {{ darkMode ? '☀️' : '🌙' }}
            </button>
          </footer>
        </div>
      </div>
    </div>
  </div>
</template>