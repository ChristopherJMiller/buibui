use std::{collections::HashMap, env, path::PathBuf, process::Command};

use tracing::info;

use super::BuibuiError;

#[derive(Clone)]
pub struct Emulator {
    pub exec_path: String,
    pub args: Vec<String>,
}

impl Emulator {
    pub fn new(exec_path: &str, args: &[&str]) -> Self {
        Self {
            exec_path: exec_path.to_string(),
            args: args.into_iter().map(|s| s.to_string()).collect(),
        }
    }
}

fn known_emulators() -> HashMap<String, Vec<Emulator>> {
    [(
        "windows".to_string(),
        vec![Emulator::new(
            "C:\\RetroArch-Win64\\retroarch.exe",
            &["-L", "bsnes2014_balanced_libretro", "-f"],
        )],
    )]
    .into()
}

fn get_first_avaliable_emulator() -> Option<Emulator> {
    let known_emulators = known_emulators();
    let emulators_for_platform = known_emulators.get(env::consts::OS).unwrap().clone();
    emulators_for_platform
        .into_iter()
        .find(|x| PathBuf::from(&x.exec_path).exists())
}

fn start_command(cmd: &str) -> Command {
    let mut command = if env::consts::OS == "windows" {
        Command::new("cmd")
    } else {
        Command::new("sh")
    };

    if env::consts::OS == "windows" {
        command.args(["/C", cmd]);
    } else {
        command.args(["-c", cmd]);
    }

    command
}

pub fn launch_hack(hack_location: String) -> Result<(), BuibuiError> {
    let emulator = get_first_avaliable_emulator().ok_or(BuibuiError::NoEmulatorAvaliable)?;
    let mut command = start_command(&emulator.exec_path);
    command.args(emulator.args).arg(hack_location);

    info!("Launching {:?}", command);

    command.spawn().ok();

    Ok(())
}
