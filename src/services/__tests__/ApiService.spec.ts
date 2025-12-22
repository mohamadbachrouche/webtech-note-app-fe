import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as ApiService from '../ApiService'

// 1. Define the mocks BEFORE imports using vi.hoisted
const mockedAxios = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}))

// 2. Mock axios with a factory function that returns our hoisted mocks
vi.mock('axios', () => {
  return {
    default: {
      create: vi.fn(() => mockedAxios),
    },
  }
})

describe('ApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches active notes from /notes', async () => {
    const mockNotes = [{ id: 1, title: 'Test' }]
    mockedAxios.get.mockResolvedValue({ data: mockNotes })

    const result = await ApiService.getActiveNotes()

    expect(mockedAxios.get).toHaveBeenCalledWith('/notes')
    expect(result.data).toEqual(mockNotes)
  })

  it('fetches trashed notes from /notes/trash', async () => {
    mockedAxios.get.mockResolvedValue({ data: [] })
    await ApiService.getTrashedNotes()
    expect(mockedAxios.get).toHaveBeenCalledWith('/notes/trash')
  })

  it('creates a note via POST /notes', async () => {
    const newNote = { title: 'New Note' }
    mockedAxios.post.mockResolvedValue({ data: { id: 1, ...newNote } })

    await ApiService.createNote(newNote)
    expect(mockedAxios.post).toHaveBeenCalledWith('/notes', newNote)
  })

  it('moves a note to trash via PUT /notes/trash/:id', async () => {
    const noteId = 123
    mockedAxios.put.mockResolvedValue({ data: { id: noteId, inTrash: true } })

    await ApiService.moveToTrash(noteId)
    expect(mockedAxios.put).toHaveBeenCalledWith(`/notes/trash/${noteId}`)
  })

  it('restores a note via PUT /notes/restore/:id', async () => {
    const noteId = 456
    mockedAxios.put.mockResolvedValue({ data: { id: noteId, inTrash: false } })

    await ApiService.restoreNote(noteId)
    expect(mockedAxios.put).toHaveBeenCalledWith(`/notes/restore/${noteId}`)
  })

  it('permanently deletes a note via DELETE /notes/permanent/:id', async () => {
    const noteId = 789
    mockedAxios.delete.mockResolvedValue({ data: {} })

    await ApiService.deleteNotePermanently(noteId)
    expect(mockedAxios.delete).toHaveBeenCalledWith(`/notes/permanent/${noteId}`)
  })
})
