import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField, { type TextFieldProps } from '@mui/material/TextField';
import { useState } from 'react';

type PasswordFieldProps = Omit<TextFieldProps, 'type' | 'slotProps'>;

/** A password field with a BUTTON that reveals what was typed. */
const PasswordField = (props: PasswordFieldProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <TextField
      {...props}
      type={isVisible ? 'text' : 'password'}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position='end'>
              <IconButton
                aria-label={isVisible ? 'Hide password' : 'Show password'}
                type='button'
                edge='end'
                size='small'
                onClick={() => setIsVisible((wasVisible) => !wasVisible)}
                onMouseDown={(event) => event.preventDefault()}
              >
                {isVisible ? (
                  <VisibilityOff fontSize='small' />
                ) : (
                  <Visibility fontSize='small' />
                )}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export default PasswordField;
