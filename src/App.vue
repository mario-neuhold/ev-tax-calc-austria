<script setup lang="ts">
import { ref, computed } from 'vue'

const leistung = ref<number>(0)
const gewicht = ref<number>(0)
const darkMode = ref(window.matchMedia('(prefers-color-scheme: dark)').matches)

// Watch system dark mode changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  darkMode.value = e.matches
})

const calculatePowerTax = (kw: number): { total: number; steps: string[] } => {
  const steps: string[] = []
  let total = 0

  // Mindestens 10 kW
  const effectiveKw = Math.max(kw, 10)

  // Erste 35 kW
  const first35 = Math.min(effectiveKw, 35)
  const first35Cost = first35 * 0.25
  total += first35Cost
  steps.push(`Erste ${first35} kW × 0,25 € = ${first35Cost.toFixed(2)} €`)

  // Nächste 25 kW
  if (effectiveKw > 35) {
    const next25 = Math.min(effectiveKw - 35, 25)
    const next25Cost = next25 * 0.35
    total += next25Cost
    steps.push(`Nächste ${next25} kW × 0,35 € = ${next25Cost.toFixed(2)} €`)
  }

  // Restliche kW
  if (effectiveKw > 60) {
    const remaining = effectiveKw - 60
    const remainingCost = remaining * 0.45
    total += remainingCost
    steps.push(`Restliche ${remaining} kW × 0,45 € = ${remainingCost.toFixed(2)} €`)
  }

  return { total, steps }
}

const calculateWeightTax = (weight: number): { total: number; steps: string[] } => {
  const steps: string[] = []
  let total = 0

  // Mindestens 200 kg
  const effectiveWeight = Math.max(weight, 200)
  const reducedWeight = Math.max(effectiveWeight - 900, 0)

  // Erste 500 kg
  const first500 = Math.min(reducedWeight, 500)
  const first500Cost = first500 * 0.015
  if (first500 > 0) {
    total += first500Cost
    steps.push(`Erste ${first500} kg × 0,015 € = ${first500Cost.toFixed(2)} €`)
  }

  // Nächste 700 kg
  if (reducedWeight > 500) {
    const next700 = Math.min(reducedWeight - 500, 700)
    const next700Cost = next700 * 0.030
    total += next700Cost
    steps.push(`Nächste ${next700} kg × 0,030 € = ${next700Cost.toFixed(2)} €`)
  }

  // Restliche kg
  if (reducedWeight > 1200) {
    const remaining = reducedWeight - 1200
    const remainingCost = remaining * 0.045
    total += remainingCost
    steps.push(`Restliche ${remaining} kg × 0,045 € = ${remainingCost.toFixed(2)} €`)
  }

  return { total, steps }
}

const result = computed(() => {
  if (!leistung.value || !gewicht.value) return null

  const powerCalc = calculatePowerTax(leistung.value)
  const weightCalc = calculateWeightTax(gewicht.value)
  
  const monthlyTotal = powerCalc.total + weightCalc.total

  return {
    powerSteps: powerCalc.steps,
    weightSteps: weightCalc.steps,
    monthlyTotal: monthlyTotal
  }
})

const hasInput = computed(() => leistung.value > 0 || gewicht.value > 0)
</script>

<template>
  <div :class="{ 'dark': darkMode }">
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
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
            <div>
              <label for="leistung" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Motorleistung (kW)
              </label>
              <div class="mt-1 relative">
                <input
                  id="leistung"
                  type="number"
                  v-model="leistung"
                  min="0"
                  placeholder="z.B. 150"
                  class="block w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  aria-describedby="leistung-hint"
                />
                <p id="leistung-hint" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Mindestens 10 kW werden berechnet
                </p>
              </div>
            </div>

            <div>
              <label for="gewicht" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Eigengewicht (kg)
              </label>
              <div class="mt-1 relative">
                <input
                  id="gewicht"
                  type="number"
                  v-model="gewicht"
                  min="0"
                  placeholder="z.B. 1800"
                  class="block w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  aria-describedby="gewicht-hint"
                />
                <p id="gewicht-hint" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Mindestens 200 kg werden berechnet, 900 kg werden abgezogen
                </p>
              </div>
            </div>
          </div>

          <div v-if="!hasInput" class="mt-8 p-4 bg-blue-50 dark:bg-blue-900 rounded-md">
            <p class="text-sm text-blue-700 dark:text-blue-200">
              👆 Geben Sie die Leistung und das Gewicht Ihres Elektrofahrzeugs ein, um die monatliche Versicherungssteuer zu berechnen.
            </p>
          </div>

          <div v-if="result" class="mt-8">
            <div class="mb-8 p-4 bg-green-50 dark:bg-green-900 rounded-md">
              <p class="text-lg font-bold text-green-800 dark:text-green-200">
                Monatliche Versicherungssteuer: {{ result.monthlyTotal.toFixed(2) }} €
              </p>
            </div>

            <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Berechnungsdetails</h2>
            
            <div class="space-y-6">
              <div>
                <h3 class="font-medium mb-2 text-gray-800 dark:text-gray-200">Leistungsabhängige Steuer:</h3>
                <ul class="list-disc pl-5 space-y-1">
                  <li v-for="step in result.powerSteps" :key="step" 
                      class="text-sm text-gray-700 dark:text-gray-300">
                    {{ step }}
                  </li>
                </ul>
              </div>

              <div>
                <h3 class="font-medium mb-2 text-gray-800 dark:text-gray-200">Gewichtsabhängige Steuer:</h3>
                <ul class="list-disc pl-5 space-y-1">
                  <li v-for="step in result.weightSteps" :key="step" 
                      class="text-sm text-gray-700 dark:text-gray-300">
                    {{ step }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <footer class="flex flex-col items-center mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p class="text-xs text-gray-500 dark:text-gray-400">
              * Stand: 06.03.2025. Die Berechnungen basieren auf inoffiziellen Informationen zum geplanten Gesetz und können sich vor der endgültigen Gesetzgebung noch ändern. 
              Alle Angaben ohne Gewähr.
            </p>
            <button
              @click="darkMode = !darkMode"
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