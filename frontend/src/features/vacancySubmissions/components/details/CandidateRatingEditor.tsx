import { Rating, Stack, Tooltip, Typography } from '@mui/material';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
import { useState } from 'react';
import { useHasPermission } from '@/features/auth/model/useHasPermission';
import {
  useAddRatingMutation,
  useRemoveRatingMutation,
  useUpdateRatingMutation,
} from '@/features/vacancySubmissions/api/vacancySubmissionEndpoints';
import { getErrorMessage } from '@/shared/lib/errorMessage';
import DeleteEntityButton from '@/shared/ui/DeleteEntityButton';
import type { NotifyHandler } from '@/types';
import CandidateRating from '@/features/vacancySubmissions/components/details/CandidateRating';

/** The backend validates the rating as an integer between 1 and 10. */
const MAX_RATING = 10;

interface CandidateRatingEditorProps {
  submissionId: string;
  rating?: number | null;
  onNotify: NotifyHandler;
}

/** The recruiter's 1-10 rating of a submission.
 * Shows the compact chip by default and swaps in the stars when clicked. Setting
 * a rating collapses it back to the chip. */
const CandidateRatingEditor = ({
  submissionId,
  rating,
  onNotify,
}: CandidateRatingEditorProps) => {
  const can = useHasPermission();

  const canRate = can('vacancySubmissions:rate');
  const canRemoveRating = can('vacancySubmissions:removeRating');

  const [isEditing, setIsEditing] = useState(false);

  const [addRating, { isLoading: isAdding }] = useAddRatingMutation();
  const [updateRating, { isLoading: isUpdating }] = useUpdateRatingMutation();
  const [removeRating, { isLoading: isRemoving }] = useRemoveRatingMutation();

  const isSaving = isAdding || isUpdating || isRemoving;
  const isRated = rating != null;

  const handleChange = async (next: number | null) => {
    if (next == null) {
      setIsEditing(false);
      return;
    }

    // The backend keeps add and update apart and rejects the wrong one, so
    // which call to make depends on whether a rating is already stored.
    const save = isRated ? updateRating : addRating;

    try {
      await save({ submissionId, rating: next }).unwrap();
      onNotify(`Rated ${next}/${MAX_RATING}.`, 'success');
      setIsEditing(false);
    } catch (error) {
      const message = getErrorMessage(
        error as FetchBaseQueryError | SerializedError,
      );
      onNotify(`Could not save the rating: ${message}`, 'error');
    }
  };

  const handleRemove = async () => {
    const removed = await removeRating(submissionId).unwrap();
    setIsEditing(false);
    return removed;
  };

  const removeButton = isRated && canRemoveRating && (
    <DeleteEntityButton
      entityLabel='rating'
      description='Remove this recruiter rating? The submission goes back to unrated.'
      onDelete={handleRemove}
      isLoading={isRemoving}
      onNotify={onNotify}
      variant='icon'
    />
  );

  if (!canRate)
    return (
      <Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
        <CandidateRating rating={rating} variant='text' />
        {removeButton}
      </Stack>
    );

  if (!isEditing)
    return (
      <Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
        <Tooltip title={isRated ? 'Change rating' : 'Rate this candidate'}>
          <span>
            <CandidateRating
              rating={rating}
              onClick={() => setIsEditing(true)}
            />
          </span>
        </Tooltip>
        {removeButton}
      </Stack>
    );

  return (
    <Stack direction='row' spacing={0.5} sx={{ alignItems: 'center' }}>
      <Rating
        name={`recruiter-rating-${submissionId}`}
        max={MAX_RATING}
        size='small'
        value={rating ?? null}
        disabled={isSaving}
        onChange={(_event, next) => void handleChange(next)}
      />

      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
        {isRated ? `${rating}/${MAX_RATING}` : 'Not rated'}
      </Typography>

      {removeButton}
    </Stack>
  );
};

export default CandidateRatingEditor;
