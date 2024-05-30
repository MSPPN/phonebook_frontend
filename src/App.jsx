import { useEffect, useState } from 'react'

import nameService from './services/names'

const Filter = ({ searchName, handleSearch }) => {
  return (
    <div>
      filter shown with <input value={searchName} onChange={handleSearch} />
    </div>
  )
}

const PersonForm = ({ newName, number, handleNameChange, handleNumber, addName }) => {
  return (
    <form onSubmit={addName}>
      <h2>Add a new</h2>
      <div>
        name: <input
          value={newName}
          onChange={handleNameChange}
        />
      </div>
      <div>
        number: <input
          value={number}
          onChange={handleNumber}
        />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  )
}

const Persons = ({ namesToShow, handleDelete }) => {


  return (
    <ul>
      {namesToShow.map(person =>
        <li key={person.name}>{person.name} {person.number}<button onClick={() => handleDelete(person.id)}>Delete</button></li>
      )}
    </ul>
  )
}

const Notification = ({ message }) => {
  if (message === null) {
    return null
  }

  return (
    <div className="notification">
      {message}
    </div>
  )
}

const Error = ({ message }) => {
  if (message === null) {
    return null
  }

  return (
    <div className="error">
      {message}
    </div>
  )
}


const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [number, setNumber] = useState('')
  const [searchName, setSearchName] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    nameService
      .getAll()
      .then(response => {
        setPersons(response.data)
      })
  }, [])

  const addName = (event) => {
    event.preventDefault()
    const existingPerson = persons.find(person => person.name === newName)
    if (existingPerson) {
      if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        const updatedPerson = { ...existingPerson, number: number }
        nameService
        .update(existingPerson.id, updatedPerson)
        .then(response => {
          setPersons(persons.map(person => person.id !== existingPerson.id ? person : response.data))
          setNewName('')
          setNumber('')
          setNotification(`Number of ${newName} has changed`)
          setTimeout(() => {
            setNotification(null)
          }, 5000)
        })
        .catch(() => {
          setErrorMessage(`Information of ${existingPerson.name} has already been removed from server`)
          setTimeout(() => {
            setErrorMessage(null)
          }, 5000)
        })
      }

      return
    }
    const nameObject = {
      name: newName,
      number: number
    }

    nameService
      .create(nameObject)
      .then(response => {
        setPersons(persons.concat(response.data))
        setNewName('')
        setNumber('')
        setNotification(`Added ${newName}`)
        setTimeout(() => {
          setNotification(null)
        }, 5000)
      })
  }



  const namesToShow = persons.filter(person => person.name.toLowerCase().includes(searchName.toLowerCase()))

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  };

  const handleNumber = (event) => {
    setNumber(event.target.value)
  }

  const handleSearch = (event) => {
    setSearchName(event.target.value)
  }

  const handleDelete = (id) => {
    const personToDelete = persons.find(person => person.id === id)
      if (window.confirm(`Delete ${personToDelete.name} ?`)) {
        nameService.deleteName(id)
          .then(() => {
            setPersons(persons.filter(person => person.id !== id))
            setNotification(`Information of ${personToDelete.name} has been removed`)
            setTimeout(() => {
              setNotification(null)
            }, 5000)
          })

    }
  }



  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={notification} />
      <Error message={errorMessage} />
      <Filter searchName={searchName} handleSearch={handleSearch} />
      <PersonForm newName={newName} number={number} handleNameChange={handleNameChange} handleNumber={handleNumber} addName={addName} />
      <h2>Numbers</h2>
      <Persons namesToShow={namesToShow} handleDelete={handleDelete}/>
    </div>
  )
}

export default App


