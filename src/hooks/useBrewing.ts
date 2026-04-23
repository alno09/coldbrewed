import { useState } from 'react';
import {
  NewBatchInput,
  NewBrewItemInput,
  getAllBatches,
  saveCompleteBatch,
} from '../database/db';

export const useBrewing = () => {
  const [loading, setLoading] = useState(false);

  const createBatch = (batch: NewBatchInput, items: NewBrewItemInput[]) => {
    setLoading(true);
    const result = saveCompleteBatch(batch, items);
    setLoading(false);
    return result;
  };

  const fetchBatches = () => getAllBatches();

  return { createBatch, fetchBatches, loading };
};
