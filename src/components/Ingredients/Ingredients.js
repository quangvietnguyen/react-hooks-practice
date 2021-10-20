import React, { useReducer, useEffect, useCallback, useMemo } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import ErrorModal from '../UI/ErrorModal';
import Search from './Search';
import useHttp from '../../hooks/http-hooks';

const ingredientReducer = (currentIngredients, action) => {
  switch (action.type) {
    case 'SET':
      return action.ingredients;
    case 'ADD':
      return [...currentIngredients, action.ingredient];
    case 'DELETE':
      return currentIngredients.filter(ingre => ingre.id !== action.id);
    default:
      throw new Error('Should not get there!')
  }
};

const Ingredients = () => {
  const [ingredients, dispatch] = useReducer(ingredientReducer, []);
  const {isLoading, data, error, reqExtra, reqIdentifier, clear, sendRequest} = useHttp();
  // const [ ingredients, setIngredients ] = useState([]);
  // const [ isLoading, setIsLoading ] = useState(false);
  // const [ error, setError ] = useState();

  // useEffect(() => {
  //   fetch('https://practice-hooks-91596-default-rtdb.firebaseio.com/ingredients.json').then(
  //     response => response.json()
  //   ).then(responseData => {
  //     const loadedIngredients = [];
  //     for (const key in responseData) {
  //       loadedIngredients.push({
  //         id: key,
  //         title: responseData[key].title,
  //         amount: responseData[key].amount
  //       });
  //     }
  //     setIngredients(loadedIngredients);
  //   })
  // },[]);

  useEffect(() => {
    if (!isLoading && !error && reqIdentifier === 'REMOVE_INGREDIENT') {
      dispatch({type:'DELETE', id: reqExtra})
    } else if (!isLoading && !error &&reqIdentifier === 'ADD_INGREDIENT') {
      dispatch({
        type: 'ADD',
        ingredient: {id: data.name, ...reqExtra}
      })
    }
  },[data, reqExtra, reqIdentifier, isLoading, error]);

  const filteredIngredientsHandler = useCallback(filteredIngredient => {
    // setIngredients(filteredIngredient);
    dispatch({type: 'SET', ingredients: filteredIngredient})
  }, []);

  const addIngredientHandler = useCallback(ingredient => {
    sendRequest(
      'https://practice-hooks-91596-default-rtdb.firebaseio.com/ingredients.json',
      'POST',
      JSON.stringify(ingredient),
      ingredient,
      'ADD_INGREDIENT'
    )
    // dispatchHttp({type:'SEND'});
    // fetch('https://practice-hooks-91596-default-rtdb.firebaseio.com/ingredients.json', {
    //   method: 'POST',
    //   body: JSON.stringify(ingredient),
    //   headers: { 'Content-Type' : 'application/json'}
    // }).then(response => {
    //   dispatchHttp({type:'RESPONSE'});
    //   return response.json();
    // }).then(responseData => {
    //   // setIngredients(prevIngredients => [
    //   //   ...prevIngredients, 
    //   //   { id: responseData.name, ...ingredient }])
    //   dispatch({
    //     type:'ADD', 
    //     ingredient: {id: responseData.name, ...ingredient}
    //   })
    // });
  },[sendRequest]);

  const removeItemHandler = useCallback((id) => {
    sendRequest(
      `https://practice-hooks-91596-default-rtdb.firebaseio.com/ingredients/${id}.json`,
      'DELETE',
      null,
      id,
      'REMOVE_INGREDIENT'
    );
    // dispatchHttp({type:'SEND'})
    // fetch(`https://practice-hooks-91596-default-rtdb.firebaseio.com/ingredients/${id}.json`, {
    //   method: 'DELETE'
    // }).then(response => {
    //   dispatchHttp({type:'RESPONSE'})
    //   // setIngredients(prevIngredients => prevIngredients.filter((item) => item.id !== id));
    //   dispatch({type: 'DELETE', id: id})
    // }).catch((error) => {
    //   dispatchHttp({type:'ERROR', errorMessage: error.message})
    // })
  },[sendRequest]);

  const ingredientList = useMemo(() => {
    return (
      <IngredientList 
        ingredients={ingredients} 
        onRemoveItem={removeItemHandler}
      />
    )
  }, [ingredients,removeItemHandler]);

  return (
    <div className="App">
      {error && <ErrorModal onClose={clear}>{error}</ErrorModal>}
      <IngredientForm 
        onAddIngredient={addIngredientHandler} 
        loading={isLoading}
      />

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler}/>
        {ingredientList}
      </section>
    </div>
  );
}

export default Ingredients;
