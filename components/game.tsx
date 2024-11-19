'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function Game() {
  const [grid, setGrid] = useState<string[][]>([])
  const [remainingTiles, setRemainingTiles] = useState<string[]>([])
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing')
  const [selectedTileIndex, setSelectedTileIndex] = useState<number | null>(null)
  const [foxTiles, setFoxTiles] = useState<[number, number][]>([])
  const [failAttempts, setFailAttempts] = useState<number>(0)

  useEffect(() => {
    resetGame()
  }, [])

  const resetGame = () => {
    // Initialize grid with diagonal 'O's
    const newGrid = Array.from({ length: 4 }, (_, i) => 
      Array.from({ length: 4 }, (_, j) => (i === j ? 'O' : ''))
    )
    setGrid(newGrid)

    // Create pool of tiles
    const tiles = ['F', 'F', 'F', 'F', 'F', 'X', 'X', 'X', 'X', 'X', 'O', 'O']
    shuffleArray(tiles)
    setRemainingTiles(tiles)

    setGameStatus('playing')
    setSelectedTileIndex(null)
    setFoxTiles([])
  }

  const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
  }

  const placeTile = (row: number, col: number) => {
    if (grid[row][col] === '' && gameStatus === 'playing' && selectedTileIndex !== null) {
      const selectedTile = remainingTiles[selectedTileIndex]
      const newGrid = grid.map((r, i) => 
        r.map((c, j) => (i === row && j === col ? selectedTile : c))
      )
      setGrid(newGrid)

      const newRemainingTiles = remainingTiles.filter((_, index) => index !== selectedTileIndex)
      setRemainingTiles(newRemainingTiles)

      setSelectedTileIndex(null)

      const foxPositions = checkForFox(newGrid)
      if (foxPositions.length > 0) {
        setGameStatus('lost')
        setFoxTiles(foxPositions)
        setFailAttempts(failAttempts + 1)
      } else if (newRemainingTiles.length === 0) {
        setGameStatus('won')
      }
    }
  }

  const checkForFox = (grid: string[][]) => {
    const foxPositions: [number, number][] = []

    // Check horizontally and vertically
    for (let i = 0; i < 4; i++) {
      const rowStr = grid[i].join('')
      const colStr = grid.map(row => row[i]).join('')

      if (rowStr.includes('FOX')) {
        const startIdx = rowStr.indexOf('FOX')
        foxPositions.push([i, startIdx], [i, startIdx + 1], [i, startIdx + 2])
      }
      if (colStr.includes('FOX')) {
        const startIdx = colStr.indexOf('FOX')
        foxPositions.push([startIdx, i], [startIdx + 1, i], [startIdx + 2, i])
      }
    }

    // Check diagonals
    const diag1 = grid[0][0] + grid[1][1] + grid[2][2] + grid[3][3]
    const diag2 = grid[0][3] + grid[1][2] + grid[2][1] + grid[3][0]

    if (diag1.includes('FOX')) {
      const startIdx = diag1.indexOf('FOX')
      foxPositions.push([startIdx, startIdx], [startIdx + 1, startIdx + 1], [startIdx + 2, startIdx + 2])
    }
    if (diag2.includes('FOX')) {
      const startIdx = diag2.indexOf('FOX')
      foxPositions.push([startIdx, 3 - startIdx], [startIdx + 1, 2 - startIdx], [startIdx + 2, 1 - startIdx])
    }

    return foxPositions
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 p-4">
      <Card className="p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">Do NOT find the Fox</h1>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {grid.map((row, i) => 
            row.map((cell, j) => (
              <Button
                key={`${i}-${j}`}
                onClick={() => placeTile(i, j)}
                className={`w-16 h-16 text-xl font-bold hover:bg-blue-100 transition-colors duration-200 ${foxTiles.some(([x, y]) => x === i && y === j) ? 'bg-red-500' : ''}`}
                variant={cell ? "secondary" : "outline"}
                disabled={cell !== '' || gameStatus !== 'playing'}
              >
                {cell}
              </Button>
            ))
          )}
        </div>
        <div className="grid grid-cols-6 gap-2 mb-4">
          {remainingTiles.map((tile, index) => (
            <Button
              key={index}
              onClick={() => setSelectedTileIndex(index)}
              className={`w-12 h-12 text-xl font-bold hover:bg-blue-100 transition-colors duration-200 ${selectedTileIndex === index ? 'bg-blue-300' : ''}`}
              variant="outline"
              disabled={gameStatus !== 'playing'}
            >
              ?
            </Button>
          ))}
        </div>
        <div className="text-center text-lg font-semibold mb-4">
          {gameStatus === 'playing' && `Select a tile and place it on the grid. Avoid spelling "FOX"!`}
          {gameStatus === 'won' && 'Congratulations! You avoided spelling "FOX"!'}
          {gameStatus === 'lost' && 'Oh no! You spelled "FOX" and lost the game.'}
        </div>
        <div className="text-center text-xl font-bold mb-4">
          {gameStatus === 'won' && 'You won!'}
          {gameStatus === 'lost' && 'You lost!'}
        </div>
        <div className="text-center text-lg font-semibold mb-4">
            Attempts: {failAttempts}
        </div>
        <Button onClick={resetGame} className="w-full transition-colors duration-200">
          Reset Game
        </Button>
      </Card>
      <footer className="mt-4 text-center">
        <p className="text-sm text-gray-500 mt-2">
          Inspired by <a href="https://donotfindthefox.com" className="text-blue-500 hover:underline">Do Not Find The Fox</a>
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Created by <a href="https://ishan.page" className="text-blue-500 hover:underline">Ishan</a>
        </p>
      </footer>
    </div>
  )
}