import {
  tablePaginationClasses as classes,
  styled,
  TablePagination,
} from '@mui/material';

export const CustomTablePagination = styled(TablePagination)`
  & .${classes.toolbar} {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding-left: 1;
  }

  & .${classes.selectLabel} {
    margin: 0;
  }

  & .${classes.input} {
    margin-left: 0;
    margin-right: 0;
  }

  & .${classes.displayedRows} {
    margin: 0;
    flex-basis: 100%;

    @media (min-width: 768px) {
      flex-basis: auto;
      margin-left: auto;
    }
  }

  & .${classes.spacer} {
    display: none;
  }

  & .${classes.actions} {
    display: flex;
    gap: 0.25rem;
  }
`;
