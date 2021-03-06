import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Typography from '@material-ui/core/Typography';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import AddToPhotosIcon from '@material-ui/icons/AddToPhotos';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import AddIcon from '@material-ui/icons/Add';
import copy from 'copy-to-clipboard';
import UI from '../../components/UI';
import UIPlaceholder from '../../components/UIPlaceholder';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { makeStyles } from '@material-ui/core';
import { URL as URLEntity } from '../../lib/entities/URL';
import { Configuration } from '../../lib/Config';
import { createURL } from '../../lib/WebUtil';

const useStyles = makeStyles(theme => ({
  margin: {
    margin: '5px'
  },
  padding: {
    border: theme.palette.type === 'dark' ? '1px solid #1f1f1f' : '1px solid #e0e0e0',
    padding: '10px'
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff'
  },
  field: {
    width: '100%'
  }
}));

export default function Urls({ config }) {
  const classes = useStyles();
  const [urls, setURLS] = useState<URLEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertOpen, setAlertOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [error, setError] = useState(false);
  const [url, setURL] = useState('');
  const [vanity, setVanity] = useState('');

  if (typeof window === 'undefined') return <UIPlaceholder />;
  else {
    const doUrls = async () => {
      const d = await (await fetch('/api/urls')).json();
      if (!d.error) {
        setURLS(d);
        setLoading(false);
      }
    };

    useEffect(() => {
      (async () => doUrls())();
    }, []);

    const deleteUrl = async (u: URLEntity) => {
      const d = await (
        await fetch('/api/urls/' + u.id, { method: 'DELETE' })
      ).json();
      if (!d.error) doUrls();
    };

    const createURLThenClose = async () => {
      const d = await (
        await fetch('/api/urls', {
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
          body: JSON.stringify({
            url,
            vanity: vanity == '' ? null : vanity
          })
        })
      ).json();
      if (!d.error) {
        setCreateOpen(false);
        doUrls();
      }
    };

    const handleChangeURLCreate = async (e) => {
      try {
        new URL(e.target.value);
        setURL(e.target.value);
        setError(false);
      } catch (e) {
        setError(true);
      }
    };

    return (
      <UI>
        <Backdrop className={classes.backdrop} open={loading}>
          <CircularProgress color='inherit' />
        </Backdrop>
        <Snackbar
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center'
          }}
          open={alertOpen}
          autoHideDuration={6000}
          onClose={() => setAlertOpen(false)}
        >
          <Alert severity='success' variant='filled'>
            Deleted URL
          </Alert>
        </Snackbar>
        <Dialog
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          aria-labelledby='create-user-title'
          aria-describedby='create-user-desc'
        >
          <DialogTitle id='create-user-title'>Create User</DialogTitle>
          <DialogContent>
            <DialogContentText id='create-user-desc'>
              <TextField
                error={error}
                helperText={error ? 'Invalid URL' : ''}
                label='URL'
                className={classes.field}
                onChange={handleChangeURLCreate}
              />
              <TextField
                label='Vanity'
                className={classes.field}
                onChange={e => setVanity(e.target.value)}
              />
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateOpen(false)} color='primary'>
              Cancel
            </Button>
            <Button onClick={createURLThenClose} color='primary' autoFocus>
              Create
            </Button>
          </DialogActions>
        </Dialog>
        {!loading ? (
          <Paper elevation={3} className={classes.padding}>
            <Typography variant='h5'>
              URLs
              <IconButton
                aria-label='Create URL'
                onClick={() => setCreateOpen(true)}
              >
                <AddIcon />
              </IconButton>
            </Typography>
            <Grid container spacing={2}>
              {urls.length > 0 ? urls.map(u => ((
                <Grid item xs={12} sm={4} key={u.id}>
                  <Card elevation={3}>
                    <CardHeader
                      action={
                        <div>
                          <IconButton aria-label='Copy URL'>
                            <FileCopyIcon
                              onClick={() => copy(createURL(window.location.href, config ? config.urls.route : '/go', u.vanity || u.id))}
                            />
                          </IconButton>
                          <Link href={u.url}>
                            <a target='_blank'>
                              <IconButton
                                aria-label='Open URL in new Tab'
                              >
                                <OpenInNewIcon />
                              </IconButton>
                            </a>
                          </Link>
                          <IconButton
                            aria-label='Delete Forever'
                            onClick={() => deleteUrl(u)}
                          >
                            <DeleteForeverIcon />
                          </IconButton>
                        </div>
                      }
                      title={u.vanity ? u.vanity : u.id}
                    />
                  </Card>
                </Grid>
              ))) : (
                <Grid
                  container
                  spacing={0}
                  direction='column'
                  alignItems='center'
                  justify='center'
                >
                  <Grid item xs={6} sm={12}>
                    <AddToPhotosIcon style={{ fontSize: 100 }} />
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Paper>
        ) : null}
      </UI>
    );
  }
}

export async function getStaticProps() {
  const config = Configuration.readConfig();
  return { props: { config } };
}